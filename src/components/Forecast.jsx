import React from 'react';
import PropTypes from 'prop-types';

import WeatherDisplay from 'components/WeatherDisplay.jsx';
import WeatherTable from 'components/WeatherTable.jsx';
import WeatherForm from 'components/WeatherForm.jsx';
import {getForecast, cancelForecast} from 'api/open-weather-map.js';

import './Forecast.css';

export default class Forecast extends React.Component {
    static propTypes = {
        unit: PropTypes.string,
        onUnitChange: PropTypes.func
    };

    static getInitForecastState() {
        let list = [];
        for (let i = 0; i < 5; i++) {
            list[i] = {
                ts: -i,
                code: -1,
                group: 'na',
                description: 'N/A',
                temp: NaN
            };
        }
        return {
            city: 'na',
            list
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            ...Forecast.getInitForecastState(),
            loading: false,
            masking: false
        };

        this.handleFormQuery = this.handleFormQuery.bind(this);
    }

    componentDidMount() {
        this.getForecast('Hsinchu', this.props.unit);
    }

    componentWillUnmount() {
        if (this.state.loading) {
            cancelForecast();
        }
    }

    render() {
        const {unit, onUnitChange} = this.props;
        const {city, list, masking} = this.state;
        const tomorrow = list[0];
        const rests = list.slice(1);

        document.body.className = `weather-bg ${tomorrow.group}`;
        document.querySelector('.weather-bg .mask').className = `mask ${masking ? 'masking' : ''}`;

        return (
            <div className='forecast'>
                <div className='tomorrow'>
                    <WeatherForm city={city} unit={unit} onQuery={this.handleFormQuery}/>
                    <WeatherDisplay {...tomorrow} day='tomorrow' unit={unit} masking={masking}/>
                </div>
                <div className='rests'>
                    <WeatherTable list={rests} unit={unit} masking={masking}/>
                </div>
            </div>
        );
    }

    getForecast(city, unit) {
        this.setState({
            loading: true,
            masking: true,
            city: city // set city state immediately to prevent input text (in WeatherForm) from blinking;
        }, () => { // called back after setState completes
            getForecast(city, unit).then(forecast => {
                this.setState({
                    ...forecast,
                    loading: false
                }, () => this.notifyUnitChange(unit));
            }).catch(err => {
                console.error('Error getting forecast', err);

                this.setState({
                    ...Forecast.getInitForecastState(unit),
                    loading: false
                }, () => this.notifyUnitChange(unit));
            });
        });

        setTimeout(() => {
            this.setState({
                masking: false
            });
        }, 600);
    }

    handleFormQuery(city, unit) {
        this.getForecast(city, unit);
    }

    notifyUnitChange(unit) {
        if (this.props.units !== unit) {
            this.props.onUnitChange(unit);
        }
    }
}
