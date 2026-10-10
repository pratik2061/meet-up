import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    public client: Redis
    constructor(
        private readonly configService: ConfigService
    ) { }

    onModuleInit() {
        const redisUrl = this.configService.get<string>('REDIS_URL')
        if (!redisUrl) {
            throw new Error("Redis Url is missing")
        }
        this.client = new Redis(redisUrl, {
            keepAlive: 60000,
            family: 0
        })
        this.client.on('connect', () => {
            console.log('Redis connected');
        })
        this.client.on('error', (err) => {
            console.log('Redis error', err);
        })
    }

    onModuleDestroy() {
        this.client.disconnect()
    }
}
