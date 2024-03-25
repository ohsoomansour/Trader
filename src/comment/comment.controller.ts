/* eslint-disable prettier/prettier */

import { Body, Controller, Post } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { WriteCommentInputDTO } from "./dtos/comment.dto";

@Controller('comments')
export class CommentController{
  constructor(private readonly commentService: CommentService){}

  @Post()
  writeComment(@Body() writingInput: WriteCommentInputDTO) {
    this.commentService.writeComment(writingInput)
  }
  
}