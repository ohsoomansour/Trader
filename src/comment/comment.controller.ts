/* eslint-disable prettier/prettier */

import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CommentInputDTO } from "./dtos/write-comment.dto";
import { UpdateCommentInputDTO } from "./dtos/update-comment.dto";

@Controller('comments')
export class CommentController{
  constructor(private readonly commentService: CommentService){}

  @Get("/allComments")
  getAllComments(){
    return this.commentService.getAllComments();
  }

  @Get("/myComment")
  getMyComment(@Req() req) {
     const me = req['member'];
     
  }

  @Post('/typing')
  typeComment(@Req() req, @Body() typingInput: CommentInputDTO) {
    const me = req['member'];
    this.commentService.typeComment(me, typingInput)
  }
  
  @Delete('/delComment/:id')
  deleteComment(@Param("id") id:number ){
    return this.commentService.delComment(id);
  }

  @Patch('/updateComment')
  updateComment(@Body() updateInfo: UpdateCommentInputDTO){
    return this.commentService.updateComment(updateInfo);
  }


}