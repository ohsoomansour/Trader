/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Comment } from "./entities/comment.entity";
import { Repository } from "typeorm";
import { WriteCommentInputDTO } from "./dtos/write-comment.dto";
import { UpdateCommentInputDTO, UpdateCommentOutputDTO } from "./dtos/update-comment.dto";
import { Member } from "src/member/entities/member.entity";

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly comments: Repository<Comment>
  ){}
  
  async getAllComments():Promise<Comment[]>{
    const allComments = await this.comments.find();
    return allComments;
  }


  async getMyComment(me:Member) {
    const myComment = await this.comments.findOne({
      where:{
        writer:{
          userId: me.userId,
        }
      }
    })
  }

  
  async writeComment(writingInput: WriteCommentInputDTO):Promise<void> {
    const comment = this.comments.create({
      content:writingInput.content
    });
    await this.comments.save(comment);
  }

  async delComment(commentId: number){
    this.comments.delete({
     id: commentId 
    })
  }

  async updateComment(updateInfo: UpdateCommentInputDTO): Promise<UpdateCommentOutputDTO>{
    try {
      const selectedContent = await this.comments.findOne({
        where:{
          id:updateInfo.id
        }
      })
      if(selectedContent){
        selectedContent.content = updateInfo.content;
        return {
          ok:true,
        }
      } else {
        return {
          ok:false,
          error: " 댓글이 제대로 업데이트가 되지 않았습니다!"
        }
      }
      
    } catch(e){
      console.error(e);
    }
    
  }

} 