import {
  Controller,
  Post,
  UseGuards,
  Request,
  Headers,
  Body,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { isString } from 'util';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @api {post} /auth/signin Sign In
   * @apiVersion 1.0.0
   * @apiName SignIn
   * @apiGroup Auth
   *
   * @apiParam {String} username User's unique username.
   * @apiParam {String} password User's password.
   *
   * @apiSuccess (200) {Number} userId Unique identifier for logged User
   * @apiSuccess (200) {String} username Unique name of logged User
   * @apiSuccess (200) {String} accessToken Token to be used to make authenticated requests
   *
   * @apiSuccessExample {json} Success-Response: 200
   *     HTTP/1.1 200 OK
   *     {
   *         "userId": 1,
   *         "username": "admin",
   *         "accessToken": "eyJhbGciOi.eyJ1c2VybmFt.NeIgBi8V1k",
   *     }
   *
   * @apiError (400) BadRequest Some of required fiels are missing.
   *
   * @apiErrorExample {text} Error-Response: 400
   *     HTTP/1.1 400 Bad Request
   *     Bad Request
   *
   * @apiError (401) Unauthorized Given credentials are incorrect.
   *
   * @apiErrorExample {json} Error-Response: 401
   *     HTTP/1.1 401 Unauthorized
   *     {
   *         "statusCode": 401,
   *         "error": "Unauthorized",
   *         "message": "Incorrect username or password."
   *     }
   */
  @Post('/signin')
  async signin(@Request() req) {
    return this.authService.signin(req.user);
  }

  /**
   * @api {post} /auth/signup Sign Up
   * @apiVersion 1.0.0
   * @apiName SignUp
   * @apiGroup Auth
   *
   * @apiParam {String} username User's unique name.
   * @apiParam {String} password User's password.
   * @apiParam {String} email User's email address.
   * @apiParam {String} lang User's language code.
   *
   * @apiSuccess (200) {Number} userId User's unique identifier
   *
   * @apiSuccessExample Success-Response: 200
   *     HTTP/1.1 200 OK
   *     {
   *         "userId": 123,
   *     }
   *
   * @apiError (400) BadRequest Some of required fiels are missing.
   *
   * @apiErrorExample {json} Error-Response: 400
   *     HTTP/1.1 400 Bad Request
   *     {
   *         "statusCode": 400,
   *         "error": "Bad Request",
   *         "message": [
   *             {
   *                 "target": {},
   *                 "property": "username",
   *                 "children": [],
   *                 "constraints": {
   *                     "maxLength": "username must be shorter than or equal to 32 characters",
   *                     "isAlphanumeric": "username must contain only letters and numbers",
   *                     "isNotEmpty": "username should not be empty"
   *                 }
   *             }
   *         ]
   *     }
   *
   * @apiError (401) Unauthorized Given credentials are invalid.
   *
   * @apiErrorExample {json} Error-Response: 401
   *     HTTP/1.1 401 Unauthorized
   *     {
   *         "statusCode": 401,
   *         "error": "Unauthorized"
   *     }
   *
   */
  @Post('/signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService
      .signup(createUserDto)
      .then(user => {
        return user.userId;
      })
      .catch(error => {
        throw error;
      });
  }

  /**
   * @api {post} /auth/signout Sign Out
   * @apiVersion 1.0.0
   * @apiName SignOut
   * @apiGroup Auth
   *
   * @apiHeader {String} Authorization Authenticated User's access token
   *
   * @apiHeaderExample {json} Header-Example:
   *     {
   *         "Authorization": "Bearer eyJhbGciOi.eyJ1c2VybmFt.NeIgBi8V1k"
   *     }
   *
   * @apiSuccess (204) NoContent Successfully logged out.
   *
   * @ApiError (401) Unauthorized Given token is invalid.
   *
   * @apiErrorExample {json} Error-Response: 401
   *     HTTP/1.1 401 Unauthorized
   *     {
   *         "statusCode": 401,
   *         "error": "Unauthorized"
   *     }
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/signout')
  @HttpCode(204)
  async signout(@Headers('authorization') auth) {
    if (!isString(auth)) {
      throw new UnauthorizedException('Auth header must be string');
    }

    if (!auth.startsWith('Bearer')) {
      throw new UnauthorizedException(
        'Auth header must be start with "Bearer"',
      );
    }
    const splitTokens = auth.split(' ');

    if (splitTokens.length !== 2) {
      throw new UnauthorizedException();
    }

    const token = splitTokens[1];

    if (token === undefined) {
      throw new UnauthorizedException();
    }

    return this.authService.signout(token);
  }
}
