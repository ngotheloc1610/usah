import { FC, memo } from "react"
import { Modal, Button } from "react-bootstrap"

import { IProgressBarModal } from "../../../interfaces/order.interface"

import './ProgressBarModal.scss';

const ProgressBarModal: FC<IProgressBarModal> = (props) => {
    const { percent, handleCancel } = props;
    return <Modal show={true}>
        <Modal.Header className="header-wrapper">
            <Modal.Title>
                <h5>Downloading...</h5>
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="table table-responsive mh-500 tableFixHead">
                <div className="progress">
                    <div className="progress-bar"
                        role="progressbar"
                        style={{ width: `${percent}%` }}
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}>
                        {percent}%
                    </div>
                </div>
            </div>
        </Modal.Body>
        <Modal.Footer className='justify-content-center'>
            <Button variant="primary" onClick={handleCancel}>
                CANCEL
            </Button>
        </Modal.Footer>
    </Modal>
}

export default memo(ProgressBarModal);