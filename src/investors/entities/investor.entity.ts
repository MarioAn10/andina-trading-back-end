import { User } from "src/auth/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'investors' })
export class Investor { 
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    address: string;

    @Column('text')
    country: string;

    @Column('text')
    city: string;

    @Column('numeric')
    bank_account: number;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;
}
