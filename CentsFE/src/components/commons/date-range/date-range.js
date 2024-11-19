import MaterialWrapper from '../material-input-wrapper/materialInputWrapper';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
export default MaterialWrapper(DateRangePicker, { type: 'DATE_RANGE' });