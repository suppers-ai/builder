#!/usr/bin/env -S deno run --allow-all

/**
 * Concurrent development script for running both app and store packages
 * This script starts both packages in development mode simultaneously
 */

import { colors } from "https://deno.land/std@0.224.0/fmt/colors.ts";

interface ProcessInfo {
  name: string;
  command: string[];
  cwd: string;
  port: number;
  color: (text: string) => string;
}

const processes: ProcessInfo[] = [
  {
    name: "APP",
    command: ["deno", "task", "dev"],
    cwd: "./packages/app",
    port: 8001,
    color: colors.blue,
  },
  {
    name: "STORE",
    command: ["deno", "task", "dev"],
    cwd: "./packages/store",
    port: 8000,
    color: colors.green,
  },
];

function formatLog(processName: string, message: string, color: (text: string) => string): string {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = color(`[${processName}]`);
  return `${colors.gray(timestamp)} ${prefix} ${message}`;
}

async function startProcess(processInfo: ProcessInfo): Promise<void> {
  const { name, command, cwd, port, color } = processInfo;
  
  console.log(formatLog(name, `Starting ${name.toLowerCase()} package on port ${port}...`, color));
  
  try {
    const process = new Deno.Command(command[0], {
      args: command.slice(1),
      cwd,
      stdout: "piped",
      stderr: "piped",
    });

    const child = process.spawn();

    // Handle stdout
    const stdoutReader = child.stdout.getReader();
    const decoder = new TextDecoder();
    
    (async () => {
      try {
        while (true) {
          const { done, value } = await stdoutReader.read();
          if (done) break;
          
          const text = decoder.decode(value);
          const lines = text.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            console.log(formatLog(name, line, color));
          }
        }
      } catch (error) {
        console.error(formatLog(name, `Stdout error: ${error.message}`, colors.red));
      }
    })();

    // Handle stderr
    const stderrReader = child.stderr.getReader();
    
    (async () => {
      try {
        while (true) {
          const { done, value } = await stderrReader.read();
          if (done) break;
          
          const text = decoder.decode(value);
          const lines = text.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            console.log(formatLog(name, colors.yellow(`WARN: ${line}`), color));
          }
        }
      } catch (error) {
        console.error(formatLog(name, `Stderr error: ${error.message}`, colors.red));
      }
    })();

    // Wait for process to complete
    const status = await child.status;
    
    if (!status.success) {
      console.error(formatLog(name, `Process exited with code ${status.code}`, colors.red));
    } else {
      console.log(formatLog(name, "Process completed successfully", color));
    }
    
  } catch (error) {
    console.error(formatLog(name, `Failed to start: ${error.message}`, colors.red));
  }
}

function printHeader(): void {
  console.log(colors.bold(colors.cyan("\n🚀 Starting Development Environment\n")));
  console.log(colors.gray("Running both app and store packages concurrently...\n"));
  
  for (const process of processes) {
    console.log(
      `${process.color("●")} ${colors.bold(process.name)}: http://localhost:${process.port}`
    );
  }
  
  console.log(colors.gray("\nPress Ctrl+C to stop all processes\n"));
  console.log(colors.gray("=" .repeat(60)));
}

function setupSignalHandlers(): void {
  const handleExit = () => {
    console.log(colors.yellow("\n\n🛑 Shutting down development environment..."));
    Deno.exit(0);
  };

  // Handle Ctrl+C
  Deno.addSignalListener("SIGINT", handleExit);
  
  // Handle termination
  Deno.addSignalListener("SIGTERM", handleExit);
}

async function main(): Promise<void> {
  printHeader();
  setupSignalHandlers();
  
  // Start all processes concurrently
  const promises = processes.map(startProcess);
  
  try {
    await Promise.all(promises);
  } catch (error) {
    console.error(colors.red(`\nDevelopment environment error: ${error.message}`));
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}