import  { Router }  from  'express';
import isVerified from '../middlewares/jwtVerification';
import DataController from '../controllers/dataController';


export default () =>{
    const api = Router();

    api.get('/initData', isVerified, DataController.userPanelPackage);
    api.get('/groupData', isVerified, DataController.groupData);
    api.get('/scheduleData', isVerified, DataController.scheduleData);
    api.get('/betData', isVerified, DataController.betData);
    api.get('/resultData', isVerified, DataController.resultData);


    //api.get('/schedule', DataController.scheduleInit);

    api.post('/createGroup', isVerified, DataController.createGroup);
    api.post('/invSending', isVerified, DataController.invSending);
    api.post('/pendInvReject', isVerified, DataController.pendInvReject);
    api.post('/recInvAccept', isVerified, DataController.recInvAccept);
    api.post('/recInvReject', isVerified, DataController.recInvReject);
    api.post('/addMatch', isVerified, DataController.addMatch);
    api.post('/betMatch', isVerified, DataController.betMatch);
    api.post('/updateResult', isVerified, DataController.updateResult);

    //api.get('/name', isVerified, DataController.userGroupMember);

    return api;
}