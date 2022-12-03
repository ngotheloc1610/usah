import Footer from "../../components/Footer"
import Header from "../../components/Header"
import "./blocked.scss"

const Blocked = () => {
    return <>
        <Header />
        <div className="h-content">
            <div className="bodybox">
                <div className="fLogout">
                    Session Ended
                </div>
                <div className="box_middle">
                    <div className="text_middle">
                        You have either clicked the Back button or revisited the same URL during the ongoing logged-in session.<br />
                    </div>
                    <br />
                    <div className="text_bottom text">
                        Please close all your browser windows and open a new browser to try again.
                    </div>
                </div>
            </div>
        </div>
        <Footer />
    </>
}

export default Blocked