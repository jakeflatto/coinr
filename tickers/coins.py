"""
This is a placeholder for our stocks class
"""
class Coin:

	def __init__(self,ticker_symbol):
		self.ticker = ticker_symbol
		self.history = self.get_ticker_end_of_day_values_history(ticker_symbol)
		self.start_date = datetime.strptime(self.history['start_date'],'%Y-%m-%d')
		self.end_date = datetime.strptime(self.history['end_date'],'%Y-%m-%d')
		self.columns = self.history['column_names']
		self.data = self.history['data']

	def get_ticker_symbols(self):
		# returns array of symbols
		r = requests.get('http://www.sharadar.com/meta/tickers.json')
		return r.json()

	def get_ticker_end_of_day_values_history(self, ticker_symbol):
		#returns a history of end of day values (such as Open, High, Low, Close)
		#optional parameters of start_date and end_date
		r = requests.get('https://www.quandl.com/api/v3/datasets/WIKI/' + ticker_symbol + '.json?api_key=' + quandl_api_key)
		return r.json()['dataset']

	def get_ticker_metadata(self,ticker_symbol):
		pass

	def get_history_dates(self):
		#takes in a previously fetched history and returns the dates contained
		dates = []
		for values in self.history['dataset']['data']:
			dates.append(datetime.strptime(values[0],'%Y-%m-%d'))
		return dates

# s = Stocks('A')
# ticker_symbols = s.get_ticker_symbols()
# end_of_day_values = s.get_ticker_end_of_day_values_history(ticker_symbol=ticker_symbols[0]['Ticker'])
# dates = s.get_history_dates(end_of_day_values)
# print(dates)
# print(len(dates))