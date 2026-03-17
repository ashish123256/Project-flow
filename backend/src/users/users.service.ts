import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserDocument> {
    const existingUser = await this.userModel
      .findOne({ email: data.email.toLowerCase() })
      .lean();

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = new this.userModel(data);
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    // Explicitly select password for auth
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .exec();
  }

  async findById(id: string): Promise<any> {
    return this.userModel.findById(id).lean().exec();
  }
}
