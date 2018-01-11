"""
Defines our coin_ticker class
* instance methods and properties related to representing and manipulating that representation of a single stock ticker, which we pull from a thirdparty API
* class methods that find stock ticker information and create new instances of stock_ticker
"""
from datetime import datetime

class CoinTicker:

	def __init__(self):
		self.ticker = None
		self.name = None
		self.newest_available_date = None
		self.oldest_available_date = None
		self.data_columns = None
		self.data = None

	def populate(self, stock_ticker_properties):
		self.ticker = stock_ticker_properties['ticker']
		self.name = stock_ticker_properties['name']
		self.description = stock_ticker_properties['description']
		self.max_date = stock_ticker_properties['max_date']
		self.min_date = stock_ticker_properties['min_date']
		self.data_columns = stock_ticker_properties['data_columns']
		self.data = stock_ticker_properties['data']
		self.dates = self.get_history_dates()

	def get_history_dates(self):
		#takes in a previously fetched history and returns the dates contained
		dates = []
		for values in self.data:
			dates.append(datetime.strptime(values[0],'%Y-%m-%d'))
		return dates