import { Controller } from '@nestjs/common';
import { WebRtcService } from './web-rtc.service';

@Controller('web-rtc')
export class WebRtcController {
  constructor(private readonly webRtcService: WebRtcService) {}
}
