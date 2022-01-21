 
import { Colors } from '../../themes';
const Footer = () => {
    return <div className="site-header" style={{ backgroundColor: Colors.lightBlue }}>
        
        <div className="container d-flex">
            
            <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4">
                <h4>Contract Us</h4>
                <span>250 North Bridge Road, #06-00 Raffles City Tower,</span>
                <div>
                    <span>Singapore 179 101</span>
                </div>
                <div>Phone: <span>'+65 6531 1555</span>
                            <span>(IP) '+81 1246 7777</span>
                </div>
                <div><span>Email: talktophillip@phillip.com.sg</span></div>
            </div>
            
            <div className="col-xs-8 col-sm-8 col-md-8 col-lg-8">
                <h4>Maintenace Center</h4>
                <div><span>Maintenance team: TDT Asia</span></div>
                <div><span>Phone: (VN) +84 24 7734 8572</span></div>
                <div><span>Email: talktophillip@phillip.com.sg</span></div>
            </div>
            
        </div>
        
    </div>
}
export default Footer;