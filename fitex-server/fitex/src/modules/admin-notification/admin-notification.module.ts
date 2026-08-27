import { Module } from '@nestjs/common'
import { EmailModule } from '../email/email.module'
import { AdminNotificationService } from './admin-notification.service'

@Module({
	imports: [EmailModule],
	providers: [AdminNotificationService],
	exports: [AdminNotificationService],
})
export class AdminNotificationModule {}
