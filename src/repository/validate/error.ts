import Remark from "./remark";

export default class Error extends Remark {
    isError(): boolean {
        return true;
    }
}
