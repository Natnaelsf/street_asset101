import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, path, ip } = request;
    const user = request.user;

    return next.handle().pipe(
      tap(() => {
        if (user && method !== "GET") {
          const entity = path.split("/")[3]?.toUpperCase() || "UNKNOWN";
          this.prisma.auditLog
            .create({
              data: {
                userId: user.id,
                action: this.getAction(method),
                entity,
                entityId: request.params.id,
                metadata: JSON.stringify({
                  path,
                  method,
                  body: this.sanitizeBody(request.body),
                }),
                ipAddress: ip,
              },
            })
            .catch(() => {});
        }
      }),
    );
  }

  private getAction(method: string): string {
    const actions: { [key: string]: string } = {
      POST: "CREATE",
      PUT: "UPDATE",
      PATCH: "UPDATE",
      DELETE: "DELETE",
    };
    return actions[method] || "READ";
  }

  private sanitizeBody(body: any): any {
    if (!body) return {};
    const sanitized = { ...body };
    delete sanitized.password;
    delete sanitized.token;
    return sanitized;
  }
}
