import json
import os.path
import dateutil.parser
import glob
import argparse


def main(root_dir, output_dir):

    """Some media types have specific resource types, status requests, and/ or names for the relevant payloads.
    This dictionary sets them for the data we used. If you use this code on different files, be sure to update
    this dictionary"""

    media_types = {'song_har': ('fetch', 206, None), 'podcast_har': ('media', 206, None),
                   'youtube_har': ('xhr', 200, 'videoplayback'), 'website_har': None}
    time_dicts = {}
    for media_type, resource_type_tuple in media_types.items():
        for path in glob.glob(os.path.join(root_dir, media_type, '*.har')):
            name = os.path.splitext(os.path.split(path)[1])[0]
            time_dicts[name] = parse_har_file(path, resource_type_tuple)

    for filename in time_dicts:
        output_file = '{}.json'.format(os.path.join(output_dir, filename))
        time_dict = time_dicts[filename]
        time_dict = convert_to_co2(time_dict)
        convert_to_json_rows(time_dict, output_file)


def convert_to_json_rows(time_dict, output_path):
    time_dict_items = time_dict.items()
    sorted_time_dict_items = sorted(time_dict_items)
    with open(output_path, 'r') as f:
        metadata = json.load(f)
    rows = [{"time": item[0], "sizeInBytes": item[1][0], "size": item[1][1]} for item in sorted_time_dict_items]
    metadata['data'] = rows
    with open(output_path, 'w') as f:
        json.dump(metadata, f, indent=2)


def convert_to_co2(time_dict):
    return_dict = {}
    for item in time_dict.items():
        time, size = item
        size_gb = size / 1e9
        energy_kwh = .006 * size_gb
        ton_co2 = 7.07e-4 * energy_kwh
        g_co2 = 1e6 * ton_co2
        return_dict[time] = (size, g_co2)
    return return_dict


def check_entry(entry, resource_type, status, text_filter):
    if resource_type is not None and entry['_resourceType'] != resource_type:
        return False
    if status is not None and entry['response']['status'] != status:
        return False
    if text_filter is not None and text_filter not in entry['request']['url']:
        return False

    return entry['response']['content']['size'] not in {-1, 0}


def parse_har_file(filename, resource_type_tuple):
    with open(filename, 'r') as f:
        json_file = json.load(f)
        entries = json_file['log']['entries']
        if resource_type_tuple is None:
            relevant_entries = [entry for entry in entries if entry['response']['content']['size'] not in {-1, 0}]

        else:
            resource_type, status, text_filter = resource_type_tuple
            relevant_entries = [entry for entry in entries if check_entry(entry, resource_type, status, text_filter)]

        start_time = dateutil.parser.parse(relevant_entries[0]['startedDateTime'])
        times = []
        sizes = []
        for entry in relevant_entries:
            size = entry['response']['content']['size']
            sizes.append(size)
            time_taken = (dateutil.parser.parse(entry['startedDateTime']) - start_time).total_seconds()
            if time_taken <= 60:
                times.append(time_taken)
            else:
                break

    time_dict = dict(zip(times, sizes))
    return time_dict


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--root_dir', default='har_files')
    parser.add_argument('--output_dir', default="output_3")
    args = parser.parse_args()
    main(args.root_dir, args.output_dir)
