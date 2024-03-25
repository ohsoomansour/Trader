/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Comment } from "./entities/comment.entity";
import { Repository } from "typeorm";
import { WriteCommentInputDTO } from "./dtos/comment.dto";

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly comments: Repository<Comment>
  ){}
  
  
  async writeComment(writingInput: WriteCommentInputDTO):Promise<void> {
    const comment = this.comments.create({
      content:writingInput.content
    });
    this.comments.save(comment);

  }
} 