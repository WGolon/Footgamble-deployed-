import User from "../models/user";
import Group from "../models/group";
import UserPanelData from '../models/UserPanelData';
import Schedule from '../models/schedule';


// Dodawanie numeru grupy do danych użytkownika
async function addGroupID(userId, id) {
    await User.findByIdAndUpdate(userId, {groupParticipant: id})
}
  // zrobione
async function groupPackage(req) {
   return  Group.findById(req.groupParticipant);
}
  // zrobione
async function scheduleQuerry() {
  return Schedule.findOne({_id: '5dcf3ca9efd413077ca193eb'})
}
  // zrobione
function isNumeric(value) {
  return /^\d{1,2}$/.test(value);
}
  // zrobione
async function updateScore(req, res, next, matchIndex) {
  let allGroupsArr, res1, res2;

  let sched = await Schedule.findOne({_id: '5dcf3ca9efd413077ca193eb'})

  let r1 = sched.matches[matchIndex].result1;
  let r2 = sched.matches[matchIndex].result2;

  allGroupsArr = await Group.find({});

  allGroupsArr.forEach(async (singleGroup) => {
    let betsMinor = [];
    let roundScore = [];
    let betsArr = [];
    singleGroup.bets.forEach(el => {
      res1 = el[2*(matchIndex)];
      res2 = el[2*(matchIndex)+1];
      betsMinor = [res1, res2];
      betsArr.push(betsMinor);
     })

    betsArr.forEach(el => {
     let b1,b2;
     b1=el[0];
     b2=el[1];
      if(b2=='-' || b1=='-') {
        roundScore.push(0);
      }else if(b1==r1 && b2==r2){
        roundScore.push(3);
      }else if(r1==r2 && b1==b2){
        roundScore.push(1);
      }else if(r1>r2 && b1>b2){
        roundScore.push(1);
      }else if(r2>r1 && b2>b1){
        roundScore.push(1);
      } else{
        roundScore.push(0);
      }
    })

    roundScore.forEach((el,index) => {
      singleGroup.score[index] += el;
    })

    await Group.findOneAndUpdate({_id: singleGroup._id},
      {$set: {"score": singleGroup.score}});
  })
}


export default {
  // zrobione
  async userPanelPackage(req, res, next) {
    let data = new UserPanelData();
      data.username = req.username;
      if(req.groupParticipant) {
        req.isPro ? data.invOUT = true : '';
      } else {
        req.isPro ? data.groupCreation = true : data.invIN = true; 
      }
      data.invitations = req.invitations;
      data.isPro = req.isPro;
      res.send(data);
  }, 

 //importowanie danych o grupie
  async groupData(req, res, next) { 
    if(req.groupParticipant){
      let data = await groupPackage(req);
      res.status(200).json(
          data,
        )
      //res.json({siema:'groupData'});
    } else {
      res.status(401).json(
        {
          msg: 'You are not a group participant',
        }
      )
    }
  },

  // zrobione
  async pendInvReject(req,res,next) {
    if(req.isPro){

      let obj1 = {
        fName: req.body.fName,
        lName: req.body.lName,
        username: req.body.username,
        groupName: req.body.groupName,
      };

      let obj2 = {
        fName: req.firstName,
        lName: req.lastName,
        username: req.username,
        groupName: req.body.groupName,
      }
      try{
        await User.findOneAndUpdate({username: req.body.username}, 
          {$pull: {"invitations.invIN": obj2}})
  
        await User.findOneAndUpdate({username: req.username}, 
          {$pull: {"invitations.invOUT": obj1}})
          
          res.status(200).json({
            msg: 'Invitation removed successfully'
          })
      } catch(err) {
        res.status(404).json({
          msg: 'did not remove that invitation',
          err
        })
      }


    }else {
      res.status(403).json({
        msg: 'did not remove that invitation'
      })
    }
  },
  // zrobione
  async recInvAccept(req,res,next) {
    let user, bets, score;
    bets = new Array(130).join('-').split('');
    score = 0;
    let obj1 = {
      fName: req.firstName,
      lName: req.lastName,
      username: req.username,
      groupName: req.body.groupName,
    }
    user = await User.findOne({username: req.body.username});
    if(!user.invitations.invOUT.find(o => o.username == req.username)) {
      res.status(400).json({
        err: 'This user did not invite you',
      })
      return;
    }
    await User.findOneAndUpdate({username: req.username}, {groupParticipant: user.groupParticipant})


    await Group.findOneAndUpdate({_id: user.groupParticipant}, 
    { $push: {'players': req.username, 'bets': bets, 'score':score}});

    await User.findOneAndUpdate({username: req.username}, 
      {$set: {"invitations.invIN": []}})

    await User.findOneAndUpdate({username: req.body.username},
      {$pull: {"invitations.invOUT": obj1}})
      .then(el=>{
      res.json({
        msg: 'Invitation accepted',
      })
    }).catch(err=>{
      res.json({
        error: err,
      })
      })
  },
  // zrobione
  async recInvReject(req,res,next) {

    let obj1 = {
      fName: req.body.fName,
      lName: req.body.lName,
      username: req.body.username,
      groupName: req.body.groupName,
    };

    let obj2 = {
      fName: req.firstName,
      lName: req.lastName,
      username: req.username,
      groupName: req.body.groupName,
    }

    await User.findOneAndUpdate({username: req.username}, 
      {$pull: {"invitations.invIN": obj1}})

    await User.findOneAndUpdate({username: req.body.username},
      {$pull: {"invitations.invOUT": obj2}})
      .then(el=>{
      res.json({
        msg: 'Invitation accepted',
      })
    }).catch(err=>{
      res.json({
        error: err,
      })
      })
  },
  // zrobione
  async invSending(req, res, next) {
    let data = await User.findOne({username: req.body.nickname})
    let duplicatedInv;

    if(data && data.invitations.invIN[0]) {
      duplicatedInv = await data.invitations.invIN.find(o => o.username === req.username);
    }

    if(data && req.body.nickname!=req.username && req.groupParticipant &&req.isPro && !duplicatedInv && !data.groupParticipant) {
      let groupData = await groupPackage(req);

      let newArr2 = {fName: data.firstName, lName: data.lastName, username: data.username, groupName: groupData.groupName} 
      await User.findOneAndUpdate({username: req.username}, 
         { $push: {"invitations.invOUT": newArr2} })

      let newArr1 = {fName: req.firstName, lName: req.lastName, username: req.username, groupName: groupData.groupName}
      await User.findOneAndUpdate({username: req.body.nickname}, 
        { $push: {"invitations.invIN": newArr1} })
        res.status(200).json({
          message: 'Player successfuly invited',
          obj: {
          fName: data.firstName,
          lName: data.lastName,
          username: data.username,
          groupName: groupData.groupName
        }
        })

    } else {      
      res.status(406).send({
        message:'You have already invited this user, or there is no such a nickname in database.',
      })
    }
  },

  // zrobione
  async createGroup(req, res, next) {
    let group;
    if(req.isPro && !req.groupParticipant) {
      let groupName = req.body.groupName;
      let groupAdmin = req.username;
      let players = req.username;
      let score = 0;
      let bets = [new Array(130).join('-').split('')];
      group = new Group({groupName, groupAdmin, players, bets, score})
      await group.save((err,data)=> {
        if(err){
           res.status(404).json({
            title:'An error occured while creating a new group',
            error: err
          })
        }
        res.status(200).json({
          message: 'success, group created',
          obj: data
        })
      });
    } else {
      res.status(401).json({message: 'Unauthorized'});
      return
    }
    await addGroupID(req.userId, group._id);
  },
  // zrobione
  async scheduleData(req, res, next){
    let sched;
    try{
      sched = await scheduleQuerry()
    }catch(err) {
      res.status(404).json({
        error: err
      })
      return
    }

    sched.matches.sort(function(a, b) {
      return (a.startTime > b.startTime) ? -1 : ((a.startTime < b.startTime) ? 1 : 0);
    }) 

    if(sched){
      res.status(200).json(sched.matches);
    } else {
      res.status(404).json({
        message: 'Couldn\'t fetch schedule' 
      });
    }
  },
  // zrobione
  async addMatch(req,res,next) {
    if(!req.isAdmin) {
      res.status(401).json({
        error: 'You are not allowed to add matches'
      })
    }
    else {
      let newArr = req.body;
      try{
        await Schedule.findOneAndUpdate({_id: "5dcf3ca9efd413077ca193eb"}, 
        { $push: {"matches": newArr} })
        res.status(200).json({
          message: 'new match saved',
        })
      }catch(err) {
        res.status(404).json({
          error: err
        })
      }
    }
  },
// zrobione
  async betData(req,res,next) {
    if(req.groupParticipant) {
      let sched, sched2, group;
      try{
        sched = await scheduleQuerry()
        group = await Group.findOne({_id: req.groupParticipant});
      }catch(err) {
        res.status(401).json({
          error: err
        })
        return
      } 
      sched2 = sched.toObject();
      sched2.matches.forEach( (el, index)=> {
        sched2.matches[index].old = true;
        sched2.matches[index].result1 = '';
        sched2.matches[index].result2 = '';
        let a = sched2.matches[index].startTime;
        let b = (new Date(Date.now())).toISOString();
        a>b ? sched2.matches[index].old = false: '';
      })

      let ind = group.players.indexOf(req.username);

      sched2.matches.forEach((el, index) => {
        sched2.matches[index].result1 = group.bets[ind][2*index];
        sched2.matches[index].result2 = group.bets[ind][(2*index)+1];
      })

      sched2.matches.sort(function(a, b) {
        return (a.startTime > b.startTime) ? -1 : ((a.startTime < b.startTime) ? 1 : 0);
      })
  
      res.status(200).json(sched2.matches)
    } else {
      res.status(404).json({
        msg: 'At first you have to join group.',
      })
    }
  },
// zrobione
  async betMatch(req,res,next) {
    let sched, matchIndex, playerIndex, gr, time;

    if(isNumeric(req.body.result1) && isNumeric(req.body.result2)) {
      sched = await scheduleQuerry();
      gr = await Group.findOne({_id: req.groupParticipant});
  
      playerIndex = gr.players.indexOf(req.username);
      matchIndex = sched.matches.map(p=> p._id).indexOf(req.body._id);
      time = sched.matches[matchIndex].startTime;
      const query1 ='bets.'+playerIndex+'.'+(2*matchIndex); 
      const query2 ='bets.'+playerIndex+'.'+((2*matchIndex)+1); 
  
      if(time > (new Date(Date.now())).toISOString()) {
        try {
          let a = await Group.findByIdAndUpdate(
            {_id: req.groupParticipant},
            { $set : { [query1]: req.body.result1, [query2]: req.body.result2 }})
            res.status(200).json({
              msg: 'Results has been saved',
            })
        } catch(err) {
          res.status(404).json({
            error: err,
          })
        }
  
      }
      else {
        res.status(406).json({
          error: 'You cannot bet this match, becouse it already started'
        })
      }
    }else {
      res.status(400).json({
        error: 'You have to type number in bet places',
      })
    }
  },

  // zrobione
  async updateResult(req, res, next) {
    let sched1, sched, match, matchIndex, time;

    if(req.isAdmin &&(isNumeric(req.body.result1) && isNumeric(req.body.result2))) {
      sched = await Schedule.findOne({_id: '5dcf3ca9efd413077ca193eb'});
      matchIndex = sched.matches.map(p=> p._id).indexOf(req.body._id);
      match = sched.matches[matchIndex];
      if(match.result1 != '-'){
        res.status(400).json({
          msg: 'you have already updated this match',
        })
        return
      }
      time = sched.matches[matchIndex].endTime;

      const query1 ='matches.'+matchIndex+'.result1';
      const query2 ='matches.'+matchIndex+'.result2';

      if(time < (new Date(Date.now())).toISOString()) {
        try {
          await Schedule.findByIdAndUpdate({_id: '5dcf3ca9efd413077ca193eb'},{ $set : { [query1]: req.body.result1, [query2]: req.body.result2 }});
          updateScore(req, res, next, matchIndex, match)
          res.status(200).json({
            msg: 'Result successfully changed',
          })
        }catch(error) {
          res.status(404).json({
            err: error,
          })
        }
      } else {
        res.status(406).json({
          error: 'This match has not ended yet',
        })
      }
    }else {
      res.status(400).json({
        error: 'You have to type numbers in order to update result',
      })
    }
  },

  async resultData(req,res,next) {
    let group, scoresArr, sched, startedMatches, numberOfMatches, playersArr, betsArr;
    if(req.groupParticipant) {
      let tableHeader = ['Username'];
      let tableContent = [];
      try {
        group = await groupPackage(req);
        sched = await scheduleQuerry();

      } catch(err) {
        res.status(200).json({
          error: 'could not query database',
        })
      }
    
    scoresArr = group.score;
    playersArr = group.players;
    betsArr = group.bets;
    startedMatches = sched.matches.filter(x => x.startTime < (new Date(Date.now())).toISOString());
    

    numberOfMatches = startedMatches.length;

    startedMatches.forEach((el, index) => {
      let headerElement, t1, t2, r1, r2;
      t1 = el.team1.slice(0,3)
      t2 = el.team2.slice(0,3)
      r1 = el.result1;
      r2 = el.result2;
      headerElement = t1+'-'+t2+' '+r1+':'+r2;
      tableHeader.push(headerElement);
    })
    tableHeader.push('Points');

    betsArr.forEach( (el, index) => {
      let tableContentMinor = [];
      tableContentMinor.push(playersArr[index]);
      for(let i=0; i < numberOfMatches; i++){
        let b1, b2, betConcat;
        b1 = el[i*2];
        b2 = el[(i*2)+1];
        betConcat = b1+':'+b2;
        tableContentMinor.push(betConcat);
      }
      tableContentMinor.push(scoresArr[index]);
      tableContent.push(tableContentMinor);
    })

    tableContent.sort((a, b) => { return b[b.length-1] -a[a.length-1]})
    
    res.status(200).json({
      tableHeader,
      tableContent
    })

    } else {
      res.status(401).json({
        error: 'At first you have to join group.',
      })
    }
  }
 };

