import { Colors } from '../../themes';
import './Footer.css';
import { LOGO } from '../../assets';

const _renderContactUs = () => (
    <div className='fs-12'>
        <strong>Contact Us</strong>
        <br />
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-geo-alt-fill" viewBox="0 0 16 16">
            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
        </svg> 250 North Bridge Road, # 06-00 Raffles CityTower
        Singapore 179 101
        <div className='d-flex'>
            <span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-telephone-fill" viewBox="0 0 16 16">
                <path d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z" />
            </svg> Phone: &nbsp;</span>
            <div>
                <span> (SG) +65 6531 1555</span>
                <span>&nbsp; &nbsp; (JP) +81 1246 7777</span>
            </div>
        </div>
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope-fill" viewBox="0 0 16 16">
                <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z" />
            </svg> Email: talktopphillip@philip.com.sg
        </div>
    </div>
)
const _renderMaintenace = () => (
    <p className='fs-12'>
        <strong>Maintenace Center</strong>
        <br />
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-geo-alt-fill" viewBox="0 0 16 16">
            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
        </svg> Maintenance team: TDT Asia
        <br />
        <span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-telephone-fill" viewBox="0 0 16 16">
            <path d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z" />
        </svg> Phone: (VN)  +84 24 7734 8572</span>
        <br />
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope-fill" viewBox="0 0 16 16">
            <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z" />
        </svg> Email: maintenance@tdt.asia
    </p>
)
const _renderElementFooter = () => (
    <div className="site-header" style={{ backgroundColor: Colors.lightBlue }}>
        <div className="container">
            <div className="copyright width_common d-flex justify-content-between mb20">
                <a href="" className="site-link text-decoration-none">
                    <img src={LOGO} className="site-logo" alt="" />
                </a>
                <div className="right d-flex">
                    {/* <span className="txt-follow">2022 @Pi-X</span> */}
                </div>
            </div>
            <div className="copyright-footer flexbox width_common">

                <div className="col-xs-6 col-sm-6 col-md-6 col-lg-6">
                    {_renderContactUs()}
                </div>

                <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4">
                    {_renderMaintenace()}
                </div>
            </div>
        </div>
    </div>
)
const Footer = () => {
    return <>{_renderElementFooter()}</>
}
export default Footer;