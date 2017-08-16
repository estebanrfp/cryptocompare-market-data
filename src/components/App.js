import { h, render, Component } from 'preact'

class App extends Component {
  constructor () {
    super()

    this.state.chart = '0'
    const listing = [{
      Name: 'BTC',
      Algorithm: 'SHA256',
      CoinName: 'Bitcoin',
      Image: 'https://www.cryptocompare.com/media/19633/btc.png'
    }, {
      Name: 'ETH',
      Algorithm: 'Scrypt',
      CoinName: 'Ethereum',
      Image: 'https://www.cryptocompare.com/media/20646/eth.png?width=25'
    }, {
      Name: 'ETC',
      Algorithm: 'Scrypt',
      CoinName: 'Ethereum Classic',
      Image: 'https://www.cryptocompare.com/media/20275/etc2.png?width=25'
    }, {
      Name: 'LTC',
      Algorithm: 'Scrypt',
      CoinName: 'Litecoin',
      Image: 'https://www.cryptocompare.com/media/19782/litecoin-logo.png?width=25'
    }, {
      Name: 'DASH',
      Algorithm: 'Scrypt',
      CoinName: 'DigitalCash',
      Image: 'https://www.cryptocompare.com/media/19782/litecoin-logo.png?width=25'
    }]
    this.state.list = listing
  }
  componentDidMount () {
    console.log('componentDidMount CCurrency')

    const head = document.getElementsByTagName('head')[0]
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://estebanrfp.github.io/cryptocompare-market-data/build/streamer.js'
    script.onload = this.helper
    head.appendChild(script)

    const quote = {}

    const displayQuote = _quote => {
      const fsym = window.CCC.STATIC.CURRENCY.SYMBOL[_quote.FROMSYMBOL]
      const tsym = window.CCC.STATIC.CURRENCY.SYMBOL[_quote.TOSYMBOL]
      const pair = _quote.FROMSYMBOL + _quote.TOSYMBOL

      const node = document.getElementById(`price_${ pair }`)
      if (_quote.FLAGS === '1') {
        // node.className = 'up'
        // node.innerHTML = 'Up'
        node.style.color = 'green'
        node.parentNode.style.background = 'rgba(0, 128, 0, 0.1)'
      } else if (_quote.FLAGS === '2') {
        // node.className = 'down'
        // node.innerHTML = 'Down'
        node.style.color = 'red'
        node.parentNode.style.background = 'rgba(255, 0, 0, 0.1)'
      } else if (_quote.FLAGS === '4') {
        node.style.color = 'gray'
        node.parentNode.style.background = ''
        // node.className = ''
      }

      function renderme (id, value) {
        render(`${ value }`, document.getElementById(id), document.getElementById(id).lastChild)
      }

      renderme(`market_${ pair }`, _quote.LASTMARKET)
      renderme(`price_${ pair }`, `$ ${ _quote.PRICE }`)
      // renderme(`lastupdate_${ pair }`, Date.now())
      renderme(`volume_${ pair }`, window.CCC.convertValueToDisplay(fsym, _quote.LASTVOLUME))
      renderme(`volumeto_${ pair }`, window.CCC.convertValueToDisplay(tsym, _quote.LASTVOLUMETO))
      renderme(`24volume_${ pair }`, window.CCC.convertValueToDisplay(fsym, _quote.VOLUME24HOUR))
      renderme(`24volumeto_${ pair }`, window.CCC.convertValueToDisplay(tsym, _quote.VOLUME24HOURTO))
      renderme(`tradeid_${ pair }`, _quote.LASTTRADEID.toFixed(0))
      renderme(`change_${ pair }`, window.CCC.convertValueToDisplay(tsym, _quote.CHANGE24H))
      renderme(`changepct_${ pair }`, `${ _quote.CHANGEPCT24H.toFixed(2) }%`)
    }

    const updateQuote = result => {
      const keys = Object.keys(result)
      const pair = result.FROMSYMBOL + result.TOSYMBOL

      if (!Object.prototype.hasOwnProperty.call(quote, pair)) {
        quote[pair] = {}
        // createDom(pair)
      }
      for (let i = 0; i < keys.length; i += 1) {
        quote[pair][keys[i]] = result[keys[i]]
      }
      quote[pair].CHANGE24H = quote[pair].PRICE - quote[pair].OPEN24HOUR
      quote[pair].CHANGEPCT24H = (quote[pair].CHANGE24H / quote[pair].OPEN24HOUR) * 100
      displayQuote(quote[pair])
    }

    this.socket = require('socket.io-client')('https://streamer.cryptocompare.com/')

    // Format: {SubscriptionId}~{ExchangeName}~{FromSymbol}~{ToSymbol}
    // Use SubscriptionId 0 for TRADE, 2 for CURRENT and 5 for CURRENTAGG
    // For aggregate quote updates use CCCAGG as market

    const subscription = ['5~CCCAGG~BTC~USD', '5~CCCAGG~ETH~USD', '5~CCCAGG~ETC~USD', '5~CCCAGG~LTC~USD', '5~CCCAGG~DASH~USD']

    setTimeout(() => {
      this.socket.emit('SubAdd', { subs: subscription })
    }, 150)

    this.socket.on('m', message => {
      const messageType = message.substring(0, message.indexOf('~'))
      let res = {}
      if (messageType === window.CCC.STATIC.TYPE.CURRENTAGG) {
        res = window.CCC.CURRENT.unpack(message)
        updateQuote(res)
      }
      // const coin = message.split('~', 3)[2]
      // const price = message.split('~', 3)[2]
      // document.querySelector(`td #${ message.split('~', 3)[2] }`).innerHTML = 'hi'
      // render(<td id={ test }>{message.split('~', 3)[2]}</td>, document.body)
      // this.setState({ test: coin, price })
    })
  }

  componentWillUnmount () {
    console.log('componentWillUnmount CCurrency')
    clearInterval(this.temporizador)
    this.socket.removeListener('m')
  }

  render (props, state) {
    this.tablestyle = 'font-size: .8rem;'
    return (
      <div>
        <style>{`
        body {
          margin-top: 1rem;
          padding: 1rem;
          overflow: hidden;
        }
        table.table.table-bordered.table-hover {
            width: 100%;
            height: 100%;
        }
      `}</style>
        <article class="Post">
          <div id="content" />
          <div class="container">
            <div class="row">
              <div class="col-xs-12">
                <div class="table-responsive">
                  <table summary="test" style={ this.tablestyle } class="table table-bordered table-hover">
                    {/* <caption class="text-center">text <a href="https://getbootstrap.com/css/#tables-responsive" target="_blank" rel="noopener noreferrer">Bootstrap</a>:</caption> */}
                    <thead>
                      <tr>
                        <th>Moneda</th>
                        <th>Precio <span id="price" /></th>
                        <th>Mercado</th>
                        <th>Volumen 24H</th>
                        <th>Algoritmo</th>
                        <th>ID Última transacción</th>
                        <th>Volumen</th>
                        <th>Cargo 24H</th>
                      </tr>
                    </thead>
                    <tbody>
                      { Object.values(state.list).map(item => (
                        <tr>
                          {/* <span id={ `fsym_${ item.Name }USD` } />
                          <span id={ `tsym_${ item.Name }USD` } /> */}
                          {/* <span id={ `lastupdate_${ item.Name }USD` } >...</span> */}
                          <td>
                            <td>
                              <img role="presentation" width="25" alt="presentation" src={ item.Image } />
                            </td>
                            <td>
                              <p>{item.CoinName}</p>
                              <p>{item.Name}</p>
                            </td>
                          </td>
                          <td id={ `price_${ item.Name }USD` } >...</td>
                          <td id={ `market_${ item.Name }USD` } >...</td>
                          <td>
                            <p id={ `24volume_${ item.Name }USD` } >...</p>
                            <p id={ `24volumeto_${ item.Name }USD` } >...</p>
                          </td>
                          <td>{item.Algorithm}</td>
                          <td id={ `tradeid_${ item.Name }USD` } >...</td>
                          <td>
                            <p id={ `volume_${ item.Name }USD` } >...</p>
                            <p id={ `volumeto_${ item.Name }USD` } >...</p>
                          </td>
                          <td>
                            <p id={ `change_${ item.Name }USD` } >...</p>
                            <p id={ `changepct_${ item.Name }USD` } >...</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    )
  }
}

export default App