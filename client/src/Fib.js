import React, { Component } from "react";
import axios from 'axios'

export default class Fib extends Component{
    state = {
        seenIndices: [],
        values: {},
        index: ''
    }

    componentDidMount() {
        this.fetchValues()
        this.fetchIndices()
    }

    async fetchValues() {
        const values = await axios.get('/api/values/current')
        this.setState({
            values: values.data
        })
    }

    async fetchIndices() {
        const seenIndices = await axios.get('/api/values/all')
        this.setState({
            seenIndices: seenIndices.data
        })
    }

    renderSeenIndices() {
        return this.state.seenIndices.map(({ number }) => number).join(', ')
    }

    renderValues() {
        const results = []
        for (const key in this.state.values) {
            results.push(
                <div key={key}>
                    Index: {key}, Values: {this.state.values[key]}
                </div>
            )
        }
        return results
    }

    handleSubmit = async event => {
        event.preventDefault();
        await axios.post('/api/values', {
            index: this.state.index
        });
        this.setState({ index: '' });
    };



    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Enter a number:</label>
                    <input
                        value={this.state.index}
                        onChange={event => this.setState({index: event.target.value})}
                    />
                    <button>Submit</button>
                </form>
                <h3>Indices:</h3>
                { this.renderSeenIndices() }

                <h3>Values:</h3>
                { this.renderValues() }
            </div>
        )
    }
}
