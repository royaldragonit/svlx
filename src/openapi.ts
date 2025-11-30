// src/openapi.ts
import type { OpenAPIV3 } from "openapi-types";

const openapiSpec: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "Súc Vật Lái Xe API",
    version: "1.0.0",
    description: "API cho hệ thống report tài xế mất dạy.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local dev",
    },
  ],
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer", format: "int64" },
          email: { type: "string" },
          displayName: { type: "string" },
          avatarUrl: { type: "string", nullable: true },
          rank: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "email", "displayName"],
      },
      CarReport: {
        type: "object",
        properties: {
          id: { type: "integer", format: "int64" },
          authorId: { type: "integer", format: "int64" },
          plateNumber: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          carType: { type: "string", nullable: true },
          location: { type: "string", nullable: true },
          mainImageUrl: { type: "string", nullable: true },
          categoryTag: { type: "string", nullable: true },
          likeCount: { type: "integer" },
          commentCount: { type: "integer" },
          shareCount: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "authorId", "plateNumber", "title", "description"],
      },
      Comment: {
        type: "object",
        properties: {
          id: { type: "integer", format: "int64" },
          reportId: { type: "integer", format: "int64" },
          authorId: { type: "integer", format: "int64" },
          content: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          parentId: { type: "integer", format: "int64", nullable: true },
          likeCount: { type: "integer" },
        },
        required: ["id", "reportId", "authorId", "content"],
      },
      CreateReportInput: {
        type: "object",
        properties: {
          authorId: { type: "integer", format: "int64" },
          plateNumber: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          carType: { type: "string" },
          location: { type: "string" },
          mainImageUrl: { type: "string" },
          categoryTag: { type: "string" },
        },
        required: ["authorId", "plateNumber", "title", "description"],
      },
      CreateCommentInput: {
        type: "object",
        properties: {
          reportId: { type: "integer", format: "int64" },
          authorId: { type: "integer", format: "int64" },
          content: { type: "string" },
          parentId: { type: "integer", format: "int64", nullable: true },
        },
        required: ["reportId", "authorId", "content"],
      },
    },
  },
  paths: {
    "/api/reports": {
      get: {
        summary: "List car reports",
        tags: ["Reports"],
        parameters: [
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search by plate number",
          },
          {
            name: "category",
            in: "query",
            schema: { type: "string" },
            description: "Filter by categoryTag (Mới Cập Nhật, Nhiều Report, ...)",
          },
        ],
        responses: {
          200: {
            description: "List of reports",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/CarReport" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create new report",
        tags: ["Reports"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateReportInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CarReport" },
              },
            },
          },
        },
      },
    },
    "/api/reports/{id}": {
      get: {
        summary: "Get report by id",
        tags: ["Reports"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", format: "int64" },
          },
        ],
        responses: {
          200: {
            description: "Single report",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CarReport" },
              },
            },
          },
          404: { description: "Not found" },
        },
      },
    },
    "/api/comments": {
      post: {
        summary: "Create comment",
        tags: ["Comments"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCommentInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Comment" },
              },
            },
          },
        },
      },
    },
  },
};

export default openapiSpec;
