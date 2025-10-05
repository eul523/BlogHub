import {
    Router
} from "express";
import Notification from "../models/notificationModel.js";
import {
    protectRoute
} from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", protectRoute, async (requestAnimationFrame, res) => {
    try {
        const notifs = await Notification.find({
            userId: requestAnimationFrame.user._id,
            read: false
        });
        return res.json(notifs);
    } catch (err) {
        return res.status(500);
    }
})

router.post("/:id/read", protectRoute, async (requestAnimationFrame, res) => {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            msg: 'Invalid ID.'
        });
    }
    try{
        await Notification.findOneAndDelete({userId:req.params._id, _id:id});
        return res.json({msg:"Success"})
    }catch(err){
        return res.status(500);
    }
})

router.post("/read-all", protectRoute, async (req, res) => {
    try{
        await Notification.deleteMany({userId:req.user._id});
        return res.json({msg:"Marked all as read"})
    }catch(err){
        return res.status(500);
    }
})

export default router;