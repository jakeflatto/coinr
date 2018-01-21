import argparse
import datetime
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
import coins_correlator
import sys


"""
Take in a list of coins, a metric, a time_series_window, a sampling_interval, and a sampling_frequency argument
Return a timeseries of correlation values between a list of coins
"""

def get_start_of_interval(end_of_interval,sampling_interval):
	return end_of_interval-datetime.timedelta(days=sampling_interval)

parser = argparse.ArgumentParser()
parser.add_argument("coins",help="list of coin tickers to compare ,final chart will show correlation against the first coin on the list")
parser.add_argument("-s","--start_date", help="the first report date of your time series data",default=datetime.datetime.strftime(datetime.datetime.now(),'%Y-%m-%d'),type=str)
parser.add_argument("-w","--window", help="time series will span this many days",default=360,type=int)
parser.add_argument("-i","--interval", help="each point in time series will examine this many previous days of data",default=90,type=int)
parser.add_argument("-f","--frequency", help="number of days between each point in the final time series",default=10,type=int)
parser.add_argument("-m","--metric",help="metric for which to compare coins",default="Close",choices=['open', 'high', 'low', 'close', 'volume_traded_with', 'volume_traded_for'])
parser.add_argument("-p","--percent",help="apply a percent_change_from_beginning transformation to the data",action="store_true")
args=parser.parse_args()

# extract arguments from command line
coins = args.coins.split()
print(coins)

sampling_interval = args.interval
sampling_frequency = args.frequency
metric = args.metric

first_day = datetime.datetime.strptime(args.start_date,'%Y-%m-%d')
last_day = first_day + datetime.timedelta(days=args.window)

# Create placeholder arrays to add to while looping through coins
dfs_to_combine = []
combined_df_keys = []

# Prepare first loop iteration
end_of_interval = first_day
start_of_interval = get_start_of_interval(end_of_interval,sampling_interval)

while(end_of_interval<=last_day):
	end_of_interval_string = datetime.datetime.strftime(end_of_interval,'%Y-%m-%d')
	start_of_interval_string = datetime.datetime.strftime(start_of_interval,'%Y-%m-%d')

	print("End: {} ".format(end_of_interval_string))
	print("Start: {}".format(start_of_interval_string))
	
	corr_df = coins_correlator.get_coins_correlation(coins,'BTC',sampling_interval,metric,False,end_of_interval_string)

	corr_df['report_date'] = end_of_interval_string
	corr_df.reset_index(inplace=True)
	corr_df.set_index(['report_date','index'],inplace=True)

	print(corr_df)
	print(corr_df.index)

	dfs_to_combine.append(corr_df)

	end_of_interval = end_of_interval + datetime.timedelta(days=sampling_frequency)
	start_of_interval = get_start_of_interval(end_of_interval,sampling_interval)

combined_df = pd.concat(dfs_to_combine)
print(combined_df.xs('ETH',level=1))

df_for_plot = combined_df.xs(coins[0],level=1).reset_index()

for coin in coins[1:]:
	plt.plot(df_for_plot['report_date'],df_for_plot[coin])

plt.tick_params(axis='x',labelrotation=90)
# plt.xticks(df_for_plot['report_date'], df_for_plot['report_date'], rotation='vertical')
# Pad margins so that markers don't get clipped by the axes
plt.margins(0.2)
# Tweak spacing to prevent clipping of tick-labels
plt.subplots_adjust(bottom=0.25)

plt.show()

# first_date = datetime.datetime.strftime(then,'%Y-%m-%d')
# last_date = datetime.datetime.strftime(now,'%Y-%m-%d')