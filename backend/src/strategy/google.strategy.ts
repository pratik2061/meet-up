import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(config: ConfigService) {
        super({
            clientID: config.get<string>('GOOGLE_CLIENT_ID')!,
            clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET')!,
            callbackURL: config.get<string>('GOOGLE_CALLBACK_URL')!,
            scope: ['email', 'profile'],
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<any> {
        const { id, displayName, emails, photos } = profile;

        const user = {
            googleId: id,
            email: emails?.[0]?.value,
            fullName: displayName || 'Google User',
            avatarUrl: photos?.[0]?.value,
        };

        done(null, user);
    }
}
