import { Test, TestingModule } from '@nestjs/testing';
import { WebRtcController } from './web-rtc.controller';
import { WebRtcService } from './web-rtc.service';

describe('WebRtcController', () => {
  let controller: WebRtcController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebRtcController],
      providers: [WebRtcService],
    }).compile();

    controller = module.get<WebRtcController>(WebRtcController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
