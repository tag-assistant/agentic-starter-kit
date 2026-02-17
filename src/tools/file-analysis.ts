import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * File analysis tools — read and analyze files in the repository.
 */

export function registerFileAnalysisTools(server: McpServer) {
  server.tool(
    "read_file",
    "Read the contents of a file in the repository",
    {
      file_path: z.string().describe("Relative path to the file"),
      max_lines: z.number().min(1).max(1000).default(200).describe("Maximum lines to return"),
    },
    async ({ file_path, max_lines }) => {
      try {
        const content = await fs.readFile(file_path, "utf-8");
        const lines = content.split("\n");
        const truncated = lines.length > max_lines;
        const result = truncated ? lines.slice(0, max_lines).join("\n") : content;

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              path: file_path,
              lines: Math.min(lines.length, max_lines),
              total_lines: lines.length,
              truncated,
              content: result,
            }),
          }],
        };
      } catch {
        return { content: [{ type: "text", text: `File not found: ${file_path}` }] };
      }
    }
  );

  server.tool(
    "list_directory",
    "List files and directories at a given path",
    {
      dir_path: z.string().default(".").describe("Directory path"),
      recursive: z.boolean().default(false).describe("List recursively"),
    },
    async ({ dir_path, recursive }) => {
      async function listDir(dir: string, depth = 0): Promise<string[]> {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const results: string[] = [];

        for (const entry of entries) {
          if (entry.name.startsWith(".")) continue;
          const fullPath = path.join(dir, entry.name);
          const display = entry.isDirectory() ? `${fullPath}/` : fullPath;
          results.push(display);

          if (recursive && entry.isDirectory() && depth < 3) {
            results.push(...(await listDir(fullPath, depth + 1)));
          }
        }
        return results;
      }

      try {
        const files = await listDir(dir_path);
        return { content: [{ type: "text", text: files.join("\n") }] };
      } catch {
        return { content: [{ type: "text", text: `Directory not found: ${dir_path}` }] };
      }
    }
  );

  server.tool(
    "count_lines",
    "Count lines of code by file extension in a directory",
    {
      dir_path: z.string().default("src").describe("Directory to analyze"),
    },
    async ({ dir_path }) => {
      const counts: Record<string, { files: number; lines: number }> = {};

      async function walk(dir: string) {
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              await walk(fullPath);
            } else {
              const ext = path.extname(entry.name) || "(no ext)";
              const content = await fs.readFile(fullPath, "utf-8");
              const lineCount = content.split("\n").length;
              if (!counts[ext]) counts[ext] = { files: 0, lines: 0 };
              counts[ext].files++;
              counts[ext].lines += lineCount;
            }
          }
        } catch { /* skip unreadable dirs */ }
      }

      await walk(dir_path);
      return { content: [{ type: "text", text: JSON.stringify(counts, null, 2) }] };
    }
  );
}
