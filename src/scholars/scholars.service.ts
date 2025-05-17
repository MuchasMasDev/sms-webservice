import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import {
  bank_account_type,
  Prisma,
  public_users as User,
} from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { PaginationResultDto, SearchQueryDto } from 'src/common/dtos';
import { RoleEnum } from 'src/common/enums';
import { buildPaginationOptions } from 'src/common/utils/build-pagination-options';
import { PrismaService } from 'src/configs/prisma/prisma.service';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { EnhancedScholarsDto } from './dto/scholar-detail.dto';
import { ScholarsDto } from './dto/scholars-dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';

type ScholarWithRelations = Prisma.scholarsGetPayload<{
  include: {
    users_scholars_user_idTousers: true;
    scholar_addresses_scholars_origin_addressToscholar_addresses: true;
    scholar_addresses_scholars_current_addressToscholar_addresses: true;
    scholar_phone_numbers: true;
    scholars_logbook: true;
    banks: true;
  };
}>;

const publicUserFields = Object.values(Prisma.Public_usersScalarFieldEnum);
const scholarFields = Object.values(Prisma.ScholarsScalarFieldEnum);

@Injectable()
export class ScholarsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async create(createScholarDto: CreateScholarDto, user: User) {
    try {
      // Use a transaction to ensure all related data is created together
      return await this.prismaService.$transaction<ScholarWithRelations>(
        async (prisma) => {
          // 1. Create the user record
          const userCreated = await this.authService.signUp(
            {
              email: createScholarDto.email.toLocaleLowerCase(),
              dob: createScholarDto.dob,
              password: createScholarDto.password,
              firstName: createScholarDto.firstName,
              lastName: createScholarDto.lastName,
              roles: [RoleEnum.SCHOLAR],
            },
            new Date(createScholarDto.dob),
          );

          // 2. Create origin addresses
          let originAddressId: number | null = null;
          if (createScholarDto.currentAddressId) {
            originAddressId = createScholarDto.currentAddressId;
          } else if (createScholarDto.currentAddress) {
            const addressData = createScholarDto.currentAddress;
            const originAddress = await prisma.scholar_addresses.create({
              data: {
                street_line_1: addressData.streetLine1,
                street_line_2: addressData.streetLine2,
                district_id: addressData.districtId,
                is_urban: addressData.isUrban,
                created_at: new Date(),
                created_by: user.id,
              },
            });
            originAddressId = originAddress.id;
          }

          // 2. Create current addresses
          let currentAddressId: number | null = null;
          if (createScholarDto.currentAddress) {
            const addressData = createScholarDto.currentAddress;
            const currentAddress = await prisma.scholar_addresses.create({
              data: {
                street_line_1: addressData.streetLine1,
                street_line_2: addressData.streetLine2,
                district_id: addressData.districtId,
                is_urban: addressData.isUrban,
                created_at: new Date(),
                created_by: user.id,
              },
            });
            currentAddressId = currentAddress.id;
          }

          // 3. Create the scholar record
          const scholar = await prisma.scholars.create({
            data: {
              user_id: userCreated.id,
              dob: createScholarDto.dob,
              gender: createScholarDto.gender,
              has_disability: createScholarDto.hasDisability,
              disability_description: createScholarDto.disabilityDescription,
              number_of_children: createScholarDto.numberOfChildren,
              ingress_date: createScholarDto.ingressDate,
              emergency_contact_name: createScholarDto.emergencyContactName,
              emergency_contact_phone: createScholarDto.emergencyContactPhone,
              emergency_contact_relationship:
                createScholarDto.emergencyContactRelationship,
              bank_account_holder: createScholarDto.bankAccount.accountHolder,
              bank_account_number: createScholarDto.bankAccount.accountNumber,
              bank_account_type: createScholarDto.bankAccount.accountType,
              bank_id: createScholarDto.bankAccount.bankId,
              current_address: currentAddressId,
              origin_address: originAddressId,
              dui: createScholarDto.dui,
              state: createScholarDto.state,
              created_at: new Date(),
              created_by: user.id,
            },
          });

          // 4. Create phone numbers if provided
          if (
            createScholarDto.phoneNumbers &&
            createScholarDto.phoneNumbers.length > 0
          ) {
            for (const phoneData of createScholarDto.phoneNumbers) {
              await prisma.scholar_phone_numbers.create({
                data: {
                  scholar_id: scholar.id,
                  number: phoneData.number,
                  is_current: phoneData.isCurrent,
                },
              });
            }
          }

          // Return the created scholar with related data
          const result = await prisma.scholars.findUnique({
            where: { id: scholar.id },
            include: {
              users_scholars_user_idTousers: true,
              scholar_addresses_scholars_current_addressToscholar_addresses:
                true,
              scholar_addresses_scholars_origin_addressToscholar_addresses:
                true,
              scholar_phone_numbers: true,
              banks: true,
              scholars_logbook: true,
            },
          });

          if (!result) {
            throw new Error('Failed to retrieve created scholar');
          }

          return result;
        },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A record with the same unique constraints already exists',
          );
        }

        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Invalid reference to a related entity',
          );
        }
      }

      throw error;
    }
  }

  async update(id: string, updateDto: UpdateScholarDto, updatedBy: User) {
    const _scholar = await this.findOne(id);

    return await this.prismaService.$transaction(async (prisma) => {
      // 1. Update user record
      await prisma.public_users.update({
        where: { id: _scholar.user_id },
        data: {
          email: updateDto.email?.toLowerCase(),
          first_name: updateDto.firstName,
          last_name: updateDto.lastName,
        },
      });

      // 2. Update addresses
      let originAddressId: number | null =
        _scholar.origin_scholar_address?.id || null;
      if (updateDto.currentAddressId) {
        originAddressId = updateDto.currentAddressId;
      } else if (updateDto.originAddress && _scholar.origin_scholar_address) {
        await prisma.scholar_addresses.update({
          where: { id: _scholar.origin_scholar_address.id },
          data: {
            street_line_1: updateDto.originAddress.streetLine1,
            street_line_2: updateDto.originAddress.streetLine2,
            district_id: updateDto.originAddress.districtId,
            is_urban: updateDto.originAddress.isUrban,
            is_current: true,
          },
        });
      } else if (updateDto.originAddress) {
        const originAddress = await prisma.scholar_addresses.create({
          data: {
            street_line_1: updateDto.originAddress.streetLine1,
            street_line_2: updateDto.originAddress.streetLine2,
            district_id: updateDto.originAddress.districtId,
            is_urban: updateDto.originAddress.isUrban,
            is_current: true,
            created_at: new Date(),
            created_by: updatedBy.id,
          },
        });
        originAddressId = originAddress.id;
      }

      let currentAddressId: number | null =
        _scholar.current_scholar_address?.id || null;
      if (updateDto.currentAddress && _scholar.current_scholar_address) {
        await prisma.scholar_addresses.update({
          where: { id: _scholar.current_scholar_address.id },
          data: {
            street_line_1: updateDto.currentAddress.streetLine1,
            street_line_2: updateDto.currentAddress.streetLine2,
            district_id: updateDto.currentAddress.districtId,
            is_urban: updateDto.currentAddress.isUrban,
          },
        });
      } else if (updateDto.currentAddress) {
        const currentAddress = await prisma.scholar_addresses.create({
          data: {
            street_line_1: updateDto.currentAddress.streetLine1,
            street_line_2: updateDto.currentAddress.streetLine2,
            district_id: updateDto.currentAddress.districtId,
            is_urban: updateDto.currentAddress.isUrban,
            created_at: new Date(),
            created_by: updatedBy.id,
          },
        });
        currentAddressId = currentAddress.id;
      }

      // 3. Update the scholar record
      await prisma.scholars.update({
        where: { id },
        data: {
          dob: updateDto.dob,
          gender: updateDto.gender,
          has_disability: updateDto.hasDisability,
          disability_description: updateDto.disabilityDescription,
          number_of_children: updateDto.numberOfChildren,
          ingress_date: updateDto.ingressDate,
          emergency_contact_name: updateDto.emergencyContactName,
          emergency_contact_phone: updateDto.emergencyContactPhone,
          emergency_contact_relationship:
            updateDto.emergencyContactRelationship,
          bank_account_holder: updateDto.bankAccount.accountHolder,
          bank_account_number: updateDto.bankAccount.accountNumber,
          bank_account_type: updateDto.bankAccount.accountType,
          bank_id: updateDto.bankAccount.bankId,
          current_address: currentAddressId,
          origin_address: originAddressId,
          dui: updateDto.dui,
          state: updateDto.state,
        },
      });

      // 4. Update phone numbers
      if (updateDto.phoneNumbers) {
        for (const phone of updateDto.phoneNumbers) {
          if (phone.id) {
            await prisma.scholar_phone_numbers.update({
              where: { id: phone.id },
              data: {
                number: phone.number,
                is_current: phone.isCurrent,
              },
            });
          } else {
            await prisma.scholar_phone_numbers.create({
              data: {
                scholar_id: _scholar.id,
                number: phone.number,
                is_current: phone.isCurrent,
              },
            });
          }
        }
      }

      // Create an entry in the logbook for this update
      await prisma.scholars_logbook.create({
        data: {
          scholar_id: id,
          log: 'Scholar information updated',
          created_by: updatedBy.id,
          created_at: new Date(),
          date: new Date(),
        },
      });

      // 6. Return scholar
      return await prisma.scholars.findUnique({
        where: { id },
        include: {
          users_scholars_user_idTousers: true,
          scholar_addresses_scholars_current_addressToscholar_addresses: true,
          scholar_addresses_scholars_origin_addressToscholar_addresses: true,
          scholar_phone_numbers: true,
          banks: true,
          scholars_logbook: true,
        },
      });
    });
  }

  async findAll(
    queryDto: SearchQueryDto,
  ): Promise<PaginationResultDto<ScholarsDto>> {
    const { skip, take, where, orderBy, pageIndex, pageSize } =
      buildPaginationOptions(
        queryDto,
        this.buildScholarWhere,
        this.buildScholarOrder,
      );

    const [scholars, totalCount] = await this.prismaService.$transaction([
      this.prismaService.scholars.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          users_scholars_user_idTousers: true,
        },
      }),
      this.prismaService.scholars.count({ where }),
    ]);

    return {
      data: scholars.map((s) => ScholarsDto.fromPrisma(s)),
      total: totalCount,
      pageIndex,
      pageSize,
    };
  }

  async findOne(id: string) {
    const scholar = await this.prismaService.scholars.findUniqueOrThrow({
      where: { id },
      include: {
        scholar_addresses_scholars_current_addressToscholar_addresses: {
          include: {
            districts: {
              include: {
                municipalities: {
                  include: {
                    departments: true,
                  },
                },
              },
            },
          },
        },
        scholar_addresses_scholars_origin_addressToscholar_addresses: {
          include: {
            districts: {
              include: {
                municipalities: {
                  include: {
                    departments: true,
                  },
                },
              },
            },
          },
        },
        scholar_phone_numbers: true,
        banks: true,
        users_scholars_user_idTousers: true,
      },
    });

    return EnhancedScholarsDto.fromPrisma(scholar);
  }

  // NOTE: this service shall only be used in dev
  async remove(id: string): Promise<void> {
    const scholar = await this.findOne(id);

    await this.prismaService.$transaction(async (prisma) => {
      // DLETE AUTH USER
      await this.authService.delete(scholar.user_id);

      // 1. Delete scholar <-> phone number links and orphan phone numbers
      await prisma.scholar_phone_numbers.deleteMany({
        where: { scholar_id: id },
      });

      // 2. Delete scholar logbook entries
      await prisma.scholars_logbook.deleteMany({
        where: { scholar_id: id },
      });

      // 3. Delete scholar record
      await prisma.scholars.delete({
        where: { id },
      });

      // 4. Delete the associated public user
      await prisma.public_users.delete({
        where: { id: scholar.user_id },
      });
    });
  }

  // NOTE: this service shall only be used in dev
  async deleteAllScholars() {
    return await this.prismaService.$transaction(async (prisma) => {
      // 1. Eliminar registros relacionados (orden es importante)
      await prisma.scholar_phone_numbers.deleteMany({});
      await prisma.scholars_logbook.deleteMany({});

      // 2. Eliminar los scholars
      await prisma.scholars.deleteMany({});

      // Puedes eliminar direcciones si solo se usan por los scholars (cuida si hay foreign keys en cascada)
      await prisma.scholar_addresses.deleteMany({});

      // 3. Eliminar los usuarios relacionados (opcional, si solo los usan los scholars)
      await prisma.public_users.deleteMany({
        where: {
          roles: {
            has: RoleEnum.SCHOLAR,
          },
        },
      });

      return {
        message: 'All scholars and related data were deleted successfully',
      };
    });
  }

  async removePhoneNumber(scholar_id: string, id: number): Promise<void> {
    await this.prismaService.scholar_phone_numbers.findFirstOrThrow({
      where: { id, scholar_id },
    });
    await this.prismaService.scholar_phone_numbers.delete({ where: { id } });
  }

  private buildScholarWhere = (query: string, status: string) => {
    const where: any = {};

    if (query) {
      where.OR = [
        {
          users_scholars_user_idTousers: {
            first_name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
        {
          users_scholars_user_idTousers: {
            last_name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
        {
          users_scholars_user_idTousers: {
            ref_code: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    if (status !== 'all') {
      where.state = status;
    }

    return where;
  };

  private buildScholarOrder = (key?: string, order: 'asc' | 'desc' = 'asc') => {
    if (!key) return undefined;

    if (publicUserFields.includes(key as any)) {
      return {
        users_scholars_user_idTousers: {
          [key]: order,
        },
      };
    }

    if (scholarFields.includes(key as any)) {
      return {
        [key]: order,
      };
    }

    throw new BadRequestException('Order key does not exists');
  };
}
