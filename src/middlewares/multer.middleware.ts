import multer from 'multer';
import {v4 as uuid} from 'uuid';
const uploadImage=multer({storage:multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads');
    },
    filename:function(req,file,cb){
        const id=uuid();
        const extName=file.originalname.split('.').pop();
        const fileName=`${id}.${extName}`;
        cb(null,fileName);
    }
})});


const image=uploadImage.single("photo");

export default image;
