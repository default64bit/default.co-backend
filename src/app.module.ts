import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminController } from "./controllers/admin/admin.controller";
import { ContactMessagesController } from "./controllers/admin/contactMessages.controller";
import { PersonalInfoController } from "./controllers/admin/personalInfo.controller";
import { ProjectsController } from "./controllers/admin/projects.controller";
import { ProjectsController as WebProjectsController } from "./controllers/web/projects.controller";
import { TechAndToolsController } from "./controllers/admin/techAndTools.controller";
import { TechAndToolsController as WebTechAndToolsController } from "./controllers/web/techAndTools.controller";
import { TermsController } from "./controllers/admin/terms.controller";
import { AuthController } from "./controllers/auth.controller";
import { FileController } from "./controllers/file.controller";
import { ContactUsController } from "./controllers/web/contactUs.controller";
import { InfoController } from "./controllers/web/info.controller";
import { AuthCheckMiddleware, GuestMiddleware } from "./middlewares/auth.middleware";
import { serverOnly } from "./middlewares/server.middleware";
import { ContactMessageSchema } from "./models/contactMessages.schema";
import { ProjectSchema } from "./models/projects.schema";
import { SessionSchema } from "./models/sessions.schema";
import { TagSchema } from "./models/tags.schema";
import { TechAndToolSchema } from "./models/techAndTools.schema";
import { AuthService } from "./services/auth.service";
import { TagsService } from "./services/tags.service";

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URL, { dbName: process.env.MONGO_DB }),
        MongooseModule.forFeature([
            { name: "Session", schema: SessionSchema },
            { name: "Tag", schema: TagSchema },
            { name: "TechAndTool", schema: TechAndToolSchema },
            { name: "Project", schema: ProjectSchema },
            { name: "ContactMessage", schema: ContactMessageSchema },
        ]),
    ],
    controllers: [
        AuthController,
        FileController,
        AdminController,
        ContactUsController,
        ContactMessagesController,
        TechAndToolsController,
        ProjectsController,
        PersonalInfoController,
        TermsController,
        //
        InfoController,
        WebTechAndToolsController,
        WebProjectsController,
    ],
    providers: [AuthService, TagsService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(serverOnly).forRoutes({ path: "*", method: RequestMethod.ALL });
        consumer.apply(AuthCheckMiddleware).forRoutes(
            { path: "admin/*", method: RequestMethod.ALL },
            { path: "auth/refresh", method: RequestMethod.ALL },
            //
        );
        consumer.apply(GuestMiddleware).forRoutes(
            { path: "auth/login", method: RequestMethod.ALL },
            { path: "auth/continue-with-google", method: RequestMethod.ALL },
            //
        );
    }
}
