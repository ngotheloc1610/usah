export const _renderMsgError = () => (
    <>
        New password must contain:
        <ul>
            <li> 8 - 20 character </li>
            <li> at least one upper case letter (A, B, C...) </li>
            <li> at least one lower case letter (a, b, c...) </li>
            <li> at least one number </li>
        </ul>
    </>
)

export const _renderResetTokenErrorMessage = () => (
    <>
        <span>Your password reset link is expired. Please email/contact support to receive the set password email again.
        </span>
        <br />
        <span>Phillip SG Contact(English Speaking): +65 6212-1810</span>
        <br />
        <span>Phillip SG Email: <span className='link-custom'>cddesk@phillip.com.sg</span></span>
    </>
)