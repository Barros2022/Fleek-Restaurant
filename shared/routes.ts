import { z } from 'zod';
import { insertUserSchema, insertFeedbackSchema, feedbacks, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    user: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  feedbacks: {
    submit: {
      method: 'POST' as const,
      path: '/api/feedbacks',
      input: insertFeedbackSchema,
      responses: {
        201: z.custom<typeof feedbacks.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/feedbacks', // For logged in user to see their feedbacks
      input: z.object({
        days: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof feedbacks.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    stats: {
      method: 'GET' as const,
      path: '/api/stats', // For dashboard metrics
      input: z.object({
        days: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.object({
          totalFeedbacks: z.number(),
          npsScore: z.number(),
          avgFood: z.number(),
          avgService: z.number(),
          avgWaitTime: z.number(),
          avgAmbiance: z.number(),
          promoters: z.number(),
          passives: z.number(),
          detractors: z.number(),
        }),
        401: errorSchemas.unauthorized,
      },
    },
    deleteAll: {
      method: 'DELETE' as const,
      path: '/api/feedbacks',
      responses: {
        200: z.object({ message: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  public: {
    business: {
      method: 'GET' as const,
      path: '/api/public/business/:id', // To get business name for the public form
      responses: {
        200: z.object({
          businessName: z.string(),
        }),
        404: errorSchemas.notFound,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
