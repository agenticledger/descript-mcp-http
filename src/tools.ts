import { z } from 'zod';
import { DescriptClient } from './api-client.js';

/**
 * Descript MCP Tool Definitions
 *
 * 10 tools covering: Projects, Jobs, Import, Agent Edit, Publish, Published Projects
 */

interface ToolDef {
  name: string;
  description: string;
  inputSchema: z.ZodType<any>;
  handler: (client: DescriptClient, args: any) => Promise<any>;
}

export const tools: ToolDef[] = [
  // --- Projects (2) ---
  {
    name: 'projects_list',
    description: 'List accessible Descript projects',
    inputSchema: z.object({
      name: z.string().optional().describe('filter by project name'),
      folder_path: z.string().optional().describe('filter by folder path'),
      created_by: z.string().optional().describe('filter by creator'),
      created_after: z.string().optional().describe('ISO 8601 date'),
      created_before: z.string().optional().describe('ISO 8601 date'),
      updated_after: z.string().optional().describe('ISO 8601 date'),
      updated_before: z.string().optional().describe('ISO 8601 date'),
      sort_by: z.enum(['name', 'created_at', 'updated_at', 'last_viewed_at']).optional().describe('sort field'),
      sort_direction: z.enum(['asc', 'desc']).optional().describe('sort order'),
      limit: z.number().optional().describe('max results (1-100)'),
      cursor: z.string().optional().describe('pagination cursor'),
    }),
    handler: async (client: DescriptClient, args: any) =>
      client.listProjects(args),
  },
  {
    name: 'project_get',
    description: 'Get project details with media and compositions',
    inputSchema: z.object({
      project_id: z.string().describe('project UUID'),
    }),
    handler: async (client: DescriptClient, args: { project_id: string }) =>
      client.getProject(args.project_id),
  },

  // --- Jobs (3) ---
  {
    name: 'jobs_list',
    description: 'List recent jobs (default: last 7 days)',
    inputSchema: z.object({
      project_id: z.string().optional().describe('filter by project UUID'),
      type: z.enum(['import/project_media', 'agent']).optional().describe('job type filter'),
      created_after: z.string().optional().describe('ISO 8601 (max 30-day lookback)'),
      created_before: z.string().optional().describe('ISO 8601 date'),
      limit: z.number().optional().describe('max results (1-100, default 20)'),
      cursor: z.string().optional().describe('pagination cursor'),
    }),
    handler: async (client: DescriptClient, args: any) =>
      client.listJobs(args),
  },
  {
    name: 'job_get',
    description: 'Get job status, progress, and results',
    inputSchema: z.object({
      job_id: z.string().describe('job UUID'),
    }),
    handler: async (client: DescriptClient, args: { job_id: string }) =>
      client.getJob(args.job_id),
  },
  {
    name: 'job_cancel',
    description: 'Cancel a running job',
    inputSchema: z.object({
      job_id: z.string().describe('job UUID'),
    }),
    handler: async (client: DescriptClient, args: { job_id: string }) =>
      client.cancelJob(args.job_id),
  },

  // --- Import (1) ---
  {
    name: 'media_import',
    description: 'Create project and import media via URL or upload',
    inputSchema: z.object({
      project_name: z.string().optional().describe('new project name'),
      project_id: z.string().optional().describe('existing project UUID'),
      media_url: z.string().optional().describe('URL of media file to import'),
      media_name: z.string().optional().describe('filename for the media'),
      composition_name: z.string().optional().describe('timeline name to create'),
      callback_url: z.string().optional().describe('webhook URL for completion'),
    }),
    handler: async (client: DescriptClient, args: any) => {
      const body: any = {};
      if (args.project_name) body.project_name = args.project_name;
      if (args.project_id) body.project_id = args.project_id;
      if (args.media_url) {
        body.add_media = [{ url: args.media_url, name: args.media_name }];
      }
      if (args.composition_name) {
        body.add_compositions = [{ name: args.composition_name }];
      }
      if (args.callback_url) body.callback_url = args.callback_url;
      return client.importMedia(body);
    },
  },

  // --- Agent Edit (1) ---
  {
    name: 'agent_edit',
    description: 'AI editing via natural language prompt',
    inputSchema: z.object({
      project_id: z.string().optional().describe('project UUID (mutually exclusive with project_name)'),
      project_name: z.string().optional().describe('project name (mutually exclusive with project_id)'),
      composition_id: z.string().optional().describe('target composition UUID'),
      prompt: z.string().describe('editing instruction (e.g. "remove filler words")'),
      callback_url: z.string().optional().describe('webhook URL for completion'),
    }),
    handler: async (client: DescriptClient, args: any) =>
      client.agentEdit(args),
  },

  // --- Publish (1) ---
  {
    name: 'project_publish',
    description: 'Export project as shareable link + download',
    inputSchema: z.object({
      project_id: z.string().describe('project UUID'),
      composition_id: z.string().optional().describe('specific composition UUID'),
      media_type: z.enum(['Video', 'Audio']).optional().describe('export format'),
      resolution: z.enum(['480p', '720p', '1080p', '4K']).optional().describe('video resolution'),
      access_level: z.enum(['public', 'unlisted', 'drive', 'private']).optional().describe('sharing access'),
      callback_url: z.string().optional().describe('webhook URL for completion'),
    }),
    handler: async (client: DescriptClient, args: any) =>
      client.publishProject(args),
  },

  // --- Published Projects (1) ---
  {
    name: 'published_project_get',
    description: 'Get published project metadata and subtitles',
    inputSchema: z.object({
      slug: z.string().describe('published project slug'),
    }),
    handler: async (client: DescriptClient, args: { slug: string }) =>
      client.getPublishedProject(args.slug),
  },
];
