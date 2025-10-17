import testFailureImage from '../../../../app/images/svg/testcase/failure.svg';
import testFileImage from '../../../../app/images/svg/testcase/file.svg';
import testFinishImage from '../../../../app/images/svg/testcase/finish.svg';
import fixtureImage from '../../../../app/images/svg/testcase/fixture.svg';
import testStartImage from '../../../../app/images/svg/testcase/start.svg';
import testSuccessImage from '../../../../app/images/svg/testcase/success.svg';
import testVariantImage from '../../../../app/images/svg/testcase/variant.svg';

export default abstract class TestImages {
    static readonly Start = testStartImage;
    static readonly File = testFileImage;
    static readonly Finish = testFinishImage;
    static readonly Variant = testVariantImage;
    static readonly Success = testSuccessImage;
    static readonly Failed = testFailureImage;
    static readonly Fixture = fixtureImage;
}
