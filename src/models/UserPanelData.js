export default class UserPanelData{
    constructor(groupCreation=false, invIN=false, invOUT=false, username=false, isPro=false) {
        this.groupCreation = groupCreation;
        this.invIN = invIN;
        this.invOUT = invOUT;
        this.username = username;
        this.isPro = isPro;
    }
}