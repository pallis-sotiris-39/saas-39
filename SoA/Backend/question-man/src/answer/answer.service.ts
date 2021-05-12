import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { Answer } from "./entities/answer.entity";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { Question } from "../question/entities/question.entity";
import { User } from "../user/entities/user.entity";

@Injectable()
export class AnswerService {
  constructor(@InjectEntityManager() private manager: EntityManager) {}

  async create(createAnswerDto: CreateAnswerDto) : Promise<Answer> {
    return this.manager.transaction(async manager => {
      const questionID = createAnswerDto.question.id;
      const userID = createAnswerDto.user.id;
      if(!questionID) throw new BadRequestException('Question id missing');
      if(!userID) throw new BadRequestException('User id missing');
      const question = this.manager.findOne(Question, questionID);
      const user = this.manager.findOne(User, userID);
      if(!question) throw new NotFoundException('Question with id: ${questionId} not found');
      if(!user) throw new NotFoundException('User with id: ${userId} not found');
      const answer = await this.manager.create(Answer, createAnswerDto);
      return this.manager.save(answer);
    });
  }

  async findAll() : Promise<Answer[]> {
    return this.manager.find(Answer);
  }

  async findOne(id: number) : Promise<Answer> {
    const answer = await this.manager.findOne(Answer, id, {relations: ["question", "user"]})
    if (!answer) throw new NotFoundException('Answer with id: ${id} not found')
    return answer;
  }

  async update(id: number, updateAnswerDto: UpdateAnswerDto) : Promise<Answer> {
    return this.manager.transaction(async manager => {
      const answer = await manager.findOne(Answer, id, {relations: ["question", "user"]})
      if (!answer) throw new NotFoundException('Answer with id: ${id} not found')
      manager.merge(Answer, answer, updateAnswerDto);
      return manager.save(answer);
    });
  }

  async remove(id: number) : Promise<void>{
    return this.manager.transaction(async manager => {
      const answer = await manager.findOne(Answer, id, {relations: ["question", "user"]})
      if (!answer) throw new NotFoundException('Answer with id: ${id} not found')
      await manager.delete(Answer, id);
    });
  }

}
