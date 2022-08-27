import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Parcel extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    arrivedAt!: Date;

    @Column()
    name!: string;

    @Column()
    street!: string;

    @Column()
    streetNumber!: number;

    @Column()
    postCode!: number;

    @Column()
    region!: string;

    @Column()
    country!: string;

    @Column({ default: false })
    handedOut!: boolean;
}
