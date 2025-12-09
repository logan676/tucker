import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorCodes } from '@/common/constants/error-codes';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateUser(userId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BusinessException(
        ErrorCodes.USER_NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto): Promise<Address> {
    // If this is set as default, unset other defaults
    if (dto.isDefault) {
      await this.addressRepository.update({ userId, isDefault: true }, { isDefault: false });
    }

    // If this is the first address, make it default
    const addressCount = await this.addressRepository.count({ where: { userId } });
    const isDefault = dto.isDefault || addressCount === 0;

    const address = this.addressRepository.create({
      ...dto,
      userId,
      isDefault,
    });

    return this.addressRepository.save(address);
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new BusinessException(
        ErrorCodes.USER_NOT_FOUND,
        'Address not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // If setting as default, unset other defaults
    if (dto.isDefault && !address.isDefault) {
      await this.addressRepository.update({ userId, isDefault: true }, { isDefault: false });
    }

    Object.assign(address, dto);
    return this.addressRepository.save(address);
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new BusinessException(
        ErrorCodes.USER_NOT_FOUND,
        'Address not found',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.addressRepository.softDelete(addressId);

    // If deleted address was default, set another address as default
    if (address.isDefault) {
      const nextAddress = await this.addressRepository.findOne({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await this.addressRepository.save(nextAddress);
      }
    }
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new BusinessException(
        ErrorCodes.USER_NOT_FOUND,
        'Address not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Unset other defaults
    await this.addressRepository.update({ userId, isDefault: true }, { isDefault: false });

    address.isDefault = true;
    return this.addressRepository.save(address);
  }
}
