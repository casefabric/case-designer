import Remark from "./remark";

export default class Warning extends Remark {
    isWarning(): boolean {
        return true;
    }
}
