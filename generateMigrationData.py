import pandas as pd
import json

MIGRATION_THRESHOLD = 500000

countries = {}
migrations = {'1990': [], '1995': [], '2000': [], '2005': [], '2010': [], '2015': [], '2017': []}

citiesDF = pd.read_csv("data/cities.csv")
migrationsDF = pd.read_csv("data/unprocessedMigrations.csv")

for key, row in citiesDF.iterrows():
    country = row['country']
    city = row['city']
    lat = row['lat']
    lng = row['lng']

    coords = {}

    coords['country'] = country
    coords['city'] = city
    coords['latitude'] = lat
    coords['longitude'] = lng

    countries[country] = coords

for key, row in migrationsDF.iterrows():
    country = row['Major area, region, country or area of destination']
    year = row['Year']

    if country in countries:
        for destination, migrants in row.items():
            if destination in countries and country != destination and migrants.isdigit() and int(migrants) > MIGRATION_THRESHOLD:
                migration = {}

                migration['origin'] = countries[country]
                migration['destination'] = countries[destination]
                migration['migrants'] = migrants

                migrations[str(year)].append(migration)

with open('migrations.json', 'w') as fp:
    json.dump(migrations, fp)
