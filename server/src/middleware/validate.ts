import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

export function validate(schema: ZodType<any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.issues[0].message,
      });
      return;
    }
    req.body = parsed.data;
    next();
  };
}
