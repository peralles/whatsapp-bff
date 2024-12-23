// src/tools/dev/project-analyzer.ts
import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as prettier from 'prettier';

@Injectable()
class ProjectAnalyzer {
  private readonly ignoreDirs = new Set([
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.next',
    '.nuxt',
  ]);

  private readonly targetExtensions = new Set([
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.json',
    '.yaml',
    '.yml',
    '.env',
    '.md',
    '.nest-cli.json',
    '.eslintrc.js',
    '.prettierrc',
  ]);

  async analyzeProject(rootPath: string): Promise<ProjectAnalysis> {
    const analysis: ProjectAnalysis = {
      rootPath,
      structure: await this.analyzeDirectory(rootPath),
      dependencies: await this.analyzeDependencies(rootPath),
      nestMetadata: await this.analyzeNestMetadata(rootPath),
      statistics: {
        totalFiles: 0,
        totalDirectories: 0,
        totalSize: 0,
        fileTypes: {},
        decoratorUsage: {},
      },
    };

    await this.calculateStatistics(analysis.structure, analysis.statistics);
    return analysis;
  }

  private async analyzeDirectory(dirPath: string): Promise<DirectoryAnalysis> {
    const analysis: DirectoryAnalysis = {
      path: dirPath,
      files: [],
      subdirectories: [],
    };

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      if (await this.fileExists(path.join(dirPath, 'package.json'))) {
        const content = await fs.readFile(path.join(dirPath, 'package.json'), 'utf-8');
        analysis.packageJson = JSON.parse(content);
      }

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory() && !this.ignoreDirs.has(entry.name)) {
          analysis.subdirectories.push(await this.analyzeDirectory(fullPath));
        } else if (entry.isFile()) {
          const extension = path.extname(entry.name);
          if (this.targetExtensions.has(extension)) {
            analysis.files.push(await this.analyzeFile(fullPath));
          }
        }
      }
    } catch (error) {
      console.error(`Error analyzing directory ${dirPath}:`, error);
    }

    return analysis;
  }

  private async analyzeFile(filePath: string): Promise<FileAnalysis> {
    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);

    const analysis: FileAnalysis = {
      path: filePath,
      extension: path.extname(filePath),
      size: stats.size,
      lastModified: stats.mtime,
      imports: this.extractImports(content),
      exports: this.extractExports(content),
      decorators: this.extractDecorators(content),
      nestModules: this.extractNestModules(content),
      content: content,
    };

    return analysis;
  }

  private extractImports(content: string): string[] {
    const importRegex = /import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
    const imports = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return [...new Set(imports)];
  }

  private extractExports(content: string): string[] {
    const exportRegex = /export\s+(?:default\s+)?(?:class|interface|const|let|var|function)\s+(\w+)/g;
    const exports = [];
    let match;

    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }

    return [...new Set(exports)];
  }

  private extractDecorators(content: string): string[] {
    const decoratorRegex = /@(\w+)/g;
    const decorators = [];
    let match;

    while ((match = decoratorRegex.exec(content)) !== null) {
      decorators.push(match[1]);
    }

    return [...new Set(decorators)];
  }

  private extractNestModules(content: string): NestModuleInfo[] {
    const modules: NestModuleInfo[] = [];
    const moduleRegex = /@Module\(\{([^}]+)\}\)/g;
    let match;

    while ((match = moduleRegex.exec(content)) !== null) {
      try {
        const moduleContent = match[1];
        const imports = this.extractArrayContent(moduleContent, 'imports');
        const exports = this.extractArrayContent(moduleContent, 'exports');
        const providers = this.extractArrayContent(moduleContent, 'providers');
        const controllers = this.extractArrayContent(moduleContent, 'controllers');

        modules.push({
          imports,
          exports,
          providers,
          controllers,
        });
      } catch (error) {
        console.error('Error parsing module decorator:', error);
      }
    }

    return modules;
  }

  private extractArrayContent(content: string, property: string): string[] {
    const regex = new RegExp(`${property}\\s*:\\s*\\[(.*?)\\]`, 's');
    const match = regex.exec(content);
    if (!match) return [];

    return match[1]
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  private async analyzeDependencies(rootPath: string): Promise<Dependencies> {
    const packageJsonPath = path.join(rootPath, 'package.json');
    
    if (!await this.fileExists(packageJsonPath)) {
      return { production: [], development: [] };
    }

    const content = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);

    return {
      production: Object.keys(packageJson.dependencies || {}),
      development: Object.keys(packageJson.devDependencies || {}),
    };
  }

  private async analyzeNestMetadata(rootPath: string): Promise<NestMetadata> {
    const nestConfigPath = path.join(rootPath, 'nest-cli.json');
    
    if (!await this.fileExists(nestConfigPath)) {
      return null;
    }

    const content = await fs.readFile(nestConfigPath, 'utf-8');
    return JSON.parse(content);
  }

  private async calculateStatistics(
    directory: DirectoryAnalysis,
    statistics: ProjectAnalysis['statistics'],
  ): Promise<void> {
    statistics.totalDirectories++;

    for (const file of directory.files) {
      statistics.totalFiles++;
      statistics.totalSize += file.size;
      statistics.fileTypes[file.extension] = (statistics.fileTypes[file.extension] || 0) + 1;

      // Count decorator usage
      file.decorators.forEach(decorator => {
        statistics.decoratorUsage[decorator] = (statistics.decoratorUsage[decorator] || 0) + 1;
      });
    }

    for (const subdir of directory.subdirectories) {
      await this.calculateStatistics(subdir, statistics);
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async generateReport(analysis: ProjectAnalysis): Promise<string> {
    const report = {
      projectSummary: {
        rootPath: analysis.rootPath,
        totalFiles: analysis.statistics.totalFiles,
        totalDirectories: analysis.statistics.totalDirectories,
        totalSize: `${(analysis.statistics.totalSize / 1024 / 1024).toFixed(2)} MB`,
        fileTypes: analysis.statistics.fileTypes,
        decoratorUsage: analysis.statistics.decoratorUsage,
      },
      dependencies: analysis.dependencies,
      nestMetadata: analysis.nestMetadata,
      structure: this.simplifyStructure(analysis.structure),
    };

    return prettier.format(JSON.stringify(report), { 
      parser: 'json',
      printWidth: 100,
      tabWidth: 2,
    });
  }

  private simplifyStructure(directory: DirectoryAnalysis): any {
    return {
      path: directory.path,
      files: directory.files.map(f => ({
        path: f.path,
        size: f.size,
        imports: f.imports,
        exports: f.exports,
        decorators: f.decorators,
        nestModules: f.nestModules,
      })),
      subdirectories: directory.subdirectories.map(d => this.simplifyStructure(d)),
    };
  }
}

// Types
interface FileAnalysis {
  path: string;
  extension: string;
  size: number;
  lastModified: Date;
  imports: string[];
  exports: string[];
  decorators: string[];
  nestModules: NestModuleInfo[];
  content: string;
}

interface DirectoryAnalysis {
  path: string;
  files: FileAnalysis[];
  subdirectories: DirectoryAnalysis[];
  packageJson?: any;
}

interface Dependencies {
  production: string[];
  development: string[];
}

interface NestModuleInfo {
  imports: string[];
  exports: string[];
  providers: string[];
  controllers: string[];
}

interface NestMetadata {
  collection?: string;
  sourceRoot?: string;
  compilerOptions?: {
    tsConfigPath?: string;
    webpack?: boolean;
    webpackConfigPath?: string;
  };
  [key: string]: any;
}

interface ProjectAnalysis {
  rootPath: string;
  structure: DirectoryAnalysis;
  dependencies: Dependencies;
  nestMetadata: NestMetadata;
  statistics: {
    totalFiles: number;
    totalDirectories: number;
    totalSize: number;
    fileTypes: { [key: string]: number };
    decoratorUsage: { [key: string]: number };
  };
}

// Script execution
async function analyzeCurrentProject() {
  const analyzer = new ProjectAnalyzer();
  const projectPath = process.cwd();
  
  try {
    console.log('Analyzing project structure...');
    const analysis = await analyzer.analyzeProject(projectPath);
    
    console.log('Generating report...');
    const report = await analyzer.generateReport(analysis);
    
    const reportPath = path.join(projectPath, 'project-analysis.json');
    await fs.writeFile(reportPath, report);
    
    console.log(`Analysis complete! Report saved to ${reportPath}`);
  } catch (error) {
    console.error('Error analyzing project:', error);
    process.exit(1);
  }
}

// Execute if running directly
if (require.main === module) {
  analyzeCurrentProject();
}

export { ProjectAnalyzer, type ProjectAnalysis };