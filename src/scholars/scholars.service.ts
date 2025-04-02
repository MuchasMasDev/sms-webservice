import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma, public_users as User } from '@prisma/client';
import { PrismaService } from 'src/configs/prisma/prisma.service';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';
import { AuthService } from 'src/auth/auth.service';
import { RoleEnum } from 'src/common/enums';

type ScholarWithRelations = Prisma.scholarsGetPayload<{
  include: {
    bank_accounts: true;
    scholar_addresses: {
      include: {
        addresses: true;
      };
    };
    scholar_phone_numbers: {
      include: {
        phone_numbers: true;
      };
    };
    scholars_logbook: true;
  };
}>;

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
          const userCreated = await this.authService.signUp({
            email: createScholarDto.email,
            password: createScholarDto.password,
            firstName: createScholarDto.firstName,
            lastName: createScholarDto.lastName,
            role: RoleEnum.SCHOLAR,
          });

          // 2. Create the scholar record
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
              dui: createScholarDto.dui,
              state: createScholarDto.state,
              created_at: new Date(),
              created_by: user.id,
            },
          });

          // Return the created scholar with related data
          const result = await prisma.scholars.findUnique({
            where: { id: scholar.id },
            include: {
              bank_accounts: true,
              scholar_addresses: {
                include: {
                  addresses: true,
                },
              },
              scholar_phone_numbers: {
                include: {
                  phone_numbers: true,
                },
              },
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

  findAll() {
    return `This action returns all scholars`;
  }

  findOne(id: number) {
    return `This action returns a #${id} scholar`;
  }

  update(id: number, updateScholarDto: UpdateScholarDto) {
    console.log(updateScholarDto);
    return `This action updates a #${id} scholar`;
  }
}
