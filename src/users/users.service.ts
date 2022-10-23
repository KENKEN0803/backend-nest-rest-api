import { FRONTEND_URL } from './../common/common.constatnt';
import { LoggerService } from '../libs/logger/logger.service';
import { UserEmailInput, UserEmailOutput } from './dto/user-email.dto';
import {
  CertificatePhoneInput,
  CertificatePhoneOutput,
} from './dto/certificate-phone.dto';
import { EmailCheckOutput, EmailCheckInput } from './dto/email-check.dto';
import { EditProfileOutput, EditProfileInput } from './dto/edit-profile.dto';
import { JwtService } from '../libs/jwt/jwt.service';
import { LoginInput, LoginOutput } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-account.dto';
import { User } from './entity/user.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserProfileOutput } from './dto/user-profile.dto';
import fetch from 'node-fetch';
import { Request, Response } from 'express';
import { URLSearchParams } from 'url';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly loggerService: LoggerService,
  ) {}

  customServerErrorMessage(error: any) {
    this.loggerService
      .logger()
      .error(
        `${this.loggerService.loggerInfo(
          'extraError',
          error.message,
          error.name,
          error.stack,
        )}`,
      );
  }

  async postJoin({
    name,
    email,
    password,
    confirmation_password,
    phoneNum,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      if (password !== confirmation_password) {
        //! 사용자가 password와 confirmation_password를 다르게 입력하였을 경우
        this.loggerService
          .logger()
          .error(
            `${this.loggerService.loggerInfo(
              '사용자가 password와 confirmation_password를 다르게 입력하였을 경우',
            )}`,
          );
        return {
          ok: false,
          error: 'wrongPassword',
        };
      }

      const exists = await this.users.findOne({ email });

      if (exists) {
        //! 사용자가 password와 confirmation_password를 다르게 입력하였을 경우
        this.loggerService
          .logger()
          .error(
            `${this.loggerService.loggerInfo(
              '사용자가 password와 confirmation_password를 다르게 입력하였을 경우',
            )}`,
          );
        return {
          ok: false,
          error: 'existUser',
        };
      }

      const user = await this.users.save(
        this.users.create({
          name,
          email,
          password,
          phoneNum,
        }),
      );

      //* success
      this.loggerService
        .logger()
        .info(`${this.loggerService.loggerInfo('회원가입 성공')}`);
      return {
        ok: true,
      };
    } catch (error) {
      //! extraError
      this.customServerErrorMessage(error);
      return {
        ok: false,
        error,
      };
    }
  }

  async postLogin({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne({ email });
      if (!user) {
        //! 사용자가 존재하지 않는 이메일을 입력하였을 경우
        this.loggerService
          .logger()
          .error(
            `${this.loggerService.loggerInfo(
              '사용자가 존재하지 않는 이메일을 입력하였을 경우',
            )}`,
          );
        return {
          ok: false,
          error: 'existUser',
        };
      }

      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        //! 잘못된 비밀번호를 입력했을 경우
        this.loggerService
          .logger()
          .error(
            `${this.loggerService.loggerInfo(
              '잘못된 비밀번호를 입력했을 경우',
            )}`,
          );
        return {
          ok: false,
          error: 'wrongPassword',
        };
      }

      const token = this.jwtService.sign({ id: user.id });

      const refreshToken = this.jwtService.refreshSign({});

      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

      user.refreshToken = refreshToken;

      await this.users.save(user);

      //* success
      this.loggerService
        .logger()
        .info(`${this.loggerService.loggerInfo('로그인 성공')}`);
      return {
        ok: true,
        token,
        refreshToken: hashedRefreshToken,
      };
    } catch (error) {
      //! extraError
      this.customServerErrorMessage(error);
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(userId: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail(userId);

      //* success
      this.loggerService
        .logger()
        .info(`${this.loggerService.loggerInfo('회원 아이디 호출 성공')}`);
      return {
        ok: true,
        user,
      };
    } catch (error) {
      //! extraError
      this.loggerService
        .logger()
        .error(`${this.loggerService.loggerInfo('extraError')}`);
      return { ok: false, error: 'extraError' };
    }
  }

  async findByEmail(email: string): Promise<UserEmailOutput> {
    try {
      const user = await this.users.findOneOrFail({ email });
      //* success
      this.loggerService
        .logger()
        .info(`${this.loggerService.loggerInfo('회원 이메일 호출 성공')}`);
      return {
        ok: true,
        user,
      };
    } catch (error) {
      //! extraError
      this.customServerErrorMessage(error);
      return { ok: false, error };
    }
  }

  async putEditProfile(
    userId: number,
    { name, email, password, confirmation_password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const searchParam: Array<{ email: string }> = [];

      const user = await this.users.findOne(userId);

      if (!user) {
        //! 유저가 존재 하지 않는 경우
        this.loggerService
          .logger()
          .error(`${this.loggerService.loggerInfo('존재하지 않는 유저')}`);
        return {
          ok: false,
          error: 'notExistUser',
        };
      }

      if (password) {
        if (password !== confirmation_password) {
          //! 유저가 비밀번호와 확인 비밀번호를 제대로 입력하지 않았을 경우
          this.loggerService
            .logger()
            .error(`${this.loggerService.loggerInfo('존재하지 않는 유저')}`);
          return {
            ok: false,
            error: 'wrongPassword',
          };
        }
        user.password = password;
      }

      if (name) {
        user.name = name;
      }

      if (email) {
        if (user.email !== email) {
          searchParam.push({ email });
        }
        if (searchParam.length > 0) {
          const foundUser = await this.users.findOne({ where: searchParam });
          if (foundUser && foundUser.id !== user.id) {
            //! 유저가 이미 존재하는 유저를 입력 했을 경우 에러
            this.loggerService
              .logger()
              .error(`${this.loggerService.loggerInfo('이미 존재하는 유저')}`);
            return {
              ok: false,
              error: 'existUser',
            };
          }
        }
        user.email = email;
      }

      await this.users.save(user);

      //* success
      this.loggerService
        .logger()
        .info(`${this.loggerService.loggerInfo('이미 존재하는 유저')}`);
      return {
        ok: true,
      };
    } catch (error) {
      //! extraError
      this.customServerErrorMessage(error);
      return {
        ok: false,
        error: 'extraError',
      };
    }
  }

  async postEmailCheck({ email }: EmailCheckInput): Promise<EmailCheckOutput> {
    try {
      if (!email.includes('.com')) {
        this.loggerService
          .logger()
          .info(`${this.loggerService.loggerInfo('이메일 형식이 아닙니다')}`);
        return {
          ok: false,
          error: 'notEmail',
        };
      }
      const user = await this.users.findOne({ email });

      if (user) {
        this.loggerService
          .logger()
          .info(
            `${this.loggerService.loggerInfo('이미 존재하는 유저 입니다')}`,
          );
        return {
          ok: false,
          error: 'existUser',
        };
      }

      return {
        ok: true,
      };
    } catch (error) {
      //! extraError
      this.customServerErrorMessage(error);
      return {
        ok: false,
        error: 'extraError',
      };
    }
  }

  async postCertification({
    imp_uid,
  }: CertificatePhoneInput): Promise<CertificatePhoneOutput> {
    try {
      const getToken = await (
        await fetch('https://api.iamport.kr/users/getToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imp_key: process.env.SHOP_API_KEY, // REST API키
            imp_secret: process.env.SHOP_API_SECRET, // REST API Secret
          }),
        })
      ).json();

      const { access_token } = getToken.response;

      const getCertifications = await (
        await fetch(`https://api.iamport.kr/certifications/${imp_uid}`, {
          // imp_uid 전달
          method: 'GET', // GET method
          headers: { Authorization: access_token }, // 인증 토큰 Authorization header에 추가
        })
      ).json();

      const certificationsInfo = getCertifications.response;

      const { name, birth, phone } = certificationsInfo;
      const user = await this.users.findOne({ phoneNum: phone });
      if (user) {
        // ! 핸드폰 인증을 했을때 같은 핸드폰 번호를 가지고 있을 경우
        this.loggerService
          .logger()
          .error(
            `${this.loggerService.loggerInfo('이미 존재하는 유저 입니다')}`,
          );
        return {
          ok: false,
          status: 'fail',
        };
      }

      // * success
      this.loggerService
        .logger()
        .info(`${this.loggerService.loggerInfo('핸드폰 인증 성공')}`);
      return {
        ok: true,
        status: 'success',
      };
    } catch (error) {
      // ! extraError
      this.customServerErrorMessage(error);
      return {
        ok: false,
        error,
      };
    }
  }

  async getNaverSocialCallback(
    request: Request,
    response: Response,
  ): Promise<void> {
    const baseUrl = 'https://nid.naver.com/oauth2.0/token';
    const grantType = 'grant_type=authorization_code';
    const config = {
      client_id: process.env.NAVER_CLIENT_ID,
      client_secret: process.env.NAVER_CLIENT_SECRET,
      redirectURI: process.env.NAVER_CALLBACK_URL,
      state: request.query.state,
      code: request.query.code,
    };

    const params = new URLSearchParams({
      ...config,
      state: config.state.toString(),
      code: config.code.toString(),
    });

    const finalUrl = `${baseUrl}?${grantType}&${params}`;
    const tokenRequest = await (
      await fetch(`${finalUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    ).json();

    if ('access_token' in tokenRequest) {
      try {
        const { access_token }: any = tokenRequest;
        const apiUrl = 'https://openapi.naver.com/v1/nid/me';
        const allData = await (
          await fetch(`${apiUrl}`, {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          })
        ).json();

        if (!allData.response.email) {
          return response.redirect(`${FRONTEND_URL}/login?valid=noEmail`);
        }

        const existingUser = await this.users.findOne({
          email: allData.response.email,
        });

        if (existingUser) {
          const { id, socialOnly, email } = existingUser;

          if (socialOnly) {
            const token = this.jwtService.sign({ id });

            const refreshToken = this.jwtService.refreshSign({});

            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

            existingUser.refreshToken = refreshToken;

            await this.users.save(existingUser);

            return response.redirect(
              `${FRONTEND_URL}/login?login=true&email=${email}&token=${token}&refresh_token=${hashedRefreshToken}`,
            );
          }

          return response.redirect(`${FRONTEND_URL}/login?valid=existingUser`);
        }

        const refreshToken = this.jwtService.refreshSign({});

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        const user = await this.users.save(
          this.users.create({
            name: allData.response.name ? allData.response.name : 'Unknown',
            email: allData.response.email,
            password: '',
            socialOnly: true,
            region: '한국',
            phoneNum: allData.response.phone ? allData.response.phone : '',
            refreshToken,
          }),
        );

        const token = this.jwtService.sign({ id: user.id });

        return response.redirect(
          `${FRONTEND_URL}/login?login=true&email=${user.email}&token=${token}&refresh_token=${hashedRefreshToken}`,
        );
      } catch (error) {
        return response.redirect(`${FRONTEND_URL}/login?valid=failed`);
      }
    } else {
      return response.redirect(`${FRONTEND_URL}/login?valid=failed`);
    }
  }

  async getKakaoSocialCallback(request: Request, response: Response) {
    const baseUrl = 'https://kauth.kakao.com/oauth/token';
    const grantType = 'grant_type=authorization_code';

    const config = {
      client_id: process.env.KAKAO_CLIENT_ID,
      client_secret: process.env.KAKAO_CLIENT_SECRET,
      redirectURI: process.env.KAKAO_CALLBACK_URL,
      javascript_id: process.env.KAKAO_JAVASCRIPT_KEY_ID,
      code: request.query.code,
    };

    const params = new URLSearchParams({
      ...config,
      code: config.code.toString(),
    });

    const finalUrl = `${baseUrl}?${grantType}&${params}`;
    const tokenRequest = await (
      await fetch(`${finalUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    ).json();

    if ('access_token' in tokenRequest) {
      try {
        const { access_token }: any = tokenRequest;
        const apiUrl = 'https://kapi.kakao.com/v2/user/me';
        const allData = await (
          await fetch(`${apiUrl}`, {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          })
        ).json();

        if (!allData.kakao_account.email) {
          return response.redirect(`${FRONTEND_URL}/login?valid=noEmail`);
        }
        const existingUser = await this.users.findOne({
          email: allData.kakao_account.email,
        });

        if (existingUser) {
          const { id, socialOnly, email } = existingUser;

          if (socialOnly) {
            const token = this.jwtService.sign({ id });

            const refreshToken = this.jwtService.refreshSign({});

            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

            existingUser.refreshToken = refreshToken;

            await this.users.save(existingUser);

            return response.redirect(
              `${FRONTEND_URL}/login?login=true&email=${email}&token=${token}&refresh_token=${hashedRefreshToken}`,
            );
          }

          return response.redirect(`${FRONTEND_URL}/login?valid=existingUser`);
        }

        const refreshToken = this.jwtService.refreshSign({});

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        const user = await this.users.save(
          this.users.create({
            name: allData.kakao_account.profile.nickname
              ? allData.kakao_account.profile.nickname
              : 'Unknown',
            email: allData.kakao_account.email,
            password: '',
            socialOnly: true,
            region: '한국',
            phoneNum: allData.kakao_account.phone
              ? allData.kakao_account.phone
              : '',
            refreshToken,
          }),
        );

        const token = this.jwtService.sign({ id: user.id });

        return response.redirect(
          `${FRONTEND_URL}/login?login=true&email=${user.email}&token=${token}&refresh_token=${hashedRefreshToken}`,
        );
      } catch (error) {
        console.log(error);
        return response.redirect(`${FRONTEND_URL}/login?valid=failed`);
      }
    } else {
      return response.redirect(`${FRONTEND_URL}/login?valid=failed`);
    }
  }

  async getGoogleSocialCallback(request: Request, response: Response) {
    const baseUrl = 'https://oauth2.googleapis.com/token';
    const grantType = 'grant_type=authorization_code';

    const config = {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      code: request.query.code,
    };

    const params = new URLSearchParams({
      ...config,
      code: config.code.toString(),
    });

    const finalUrl = `${baseUrl}?${grantType}&${params}`;
    const tokenRequest = await (
      await fetch(finalUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    ).json();

    if ('access_token' in tokenRequest) {
      try {
        const { access_token }: any = tokenRequest;

        //TODO phoneNumbers를 어떻게 하면 받아올수있는지 연구 필요
        //? 어떻게 하면 받아올수있을까?

        const apiUrl =
          'https://people.googleapis.com/v1/people/me?personFields=addresses,emailAddresses,phoneNumbers,names';
        const allData = await (
          await fetch(`${apiUrl}`, {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          })
        ).json();

        if (!allData.emailAddresses[0].value) {
          return response.redirect(`${FRONTEND_URL}/login?valid=noEmail`);
        }
        const existingUser = await this.users.findOne({
          email: allData.emailAddresses[0].value,
        });

        if (existingUser) {
          const { id, socialOnly, email } = existingUser;

          if (socialOnly) {
            const token = this.jwtService.sign({ id });

            const refreshToken = this.jwtService.refreshSign({});

            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

            existingUser.refreshToken = refreshToken;

            await this.users.save(existingUser);

            return response.redirect(
              `${FRONTEND_URL}/login?login=true&email=${email}&token=${token}&refresh_token=${hashedRefreshToken}`,
            );
          }

          return response.redirect(`${FRONTEND_URL}/login?valid=existingUser`);
        }

        const refreshToken = this.jwtService.refreshSign({});

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        const user = await this.users.save(
          this.users.create({
            name: allData.emailAddresses[0].value.split('@')[0]
              ? allData.emailAddresses[0].value.split('@')[0]
              : 'Unknown',
            email: allData.emailAddresses[0].value,
            password: '',
            socialOnly: true,
            region: '한국',
            phoneNum: '',
            refreshToken,
          }),
        );

        const token = this.jwtService.sign({ id: user.id });

        return response.redirect(
          `${FRONTEND_URL}/login?login=true&email=${user.email}&token=${token}&refresh_token=${hashedRefreshToken}`,
        );
      } catch (error) {
        return response.redirect(`${FRONTEND_URL}/login?valid=failed`);
      }
    } else {
      return response.redirect(`${FRONTEND_URL}/login?valid=failed`);
    }
  }
}
