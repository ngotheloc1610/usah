import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import authSaga from "../../redux/sagas/authSaga";

const HomePage = () => {
    const { t } = useTranslation();
    useEffect(() => {
        authSaga()
       console.log(t('welcome'))
    }, [])
   return (
       <div>Home</div>
   )
}

export default HomePage