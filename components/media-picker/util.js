export const addCumulativeSize = data => {
  return data.reduce((s, d) => {
    d.cumulative = s;
    return s + d.size;
  }, 0);
};

export const getTotalSize = (data, optFilter) => {
  return data.reduce((s, d) => {
    if (optFilter) {
      return optFilter(d) ? s + d.size : s;
    }
    return s + d.size;
  }, 0);
};

export const getMaxSize = (data, optFilter) => {
  return data.reduce((m, d) => {
    return Math.max(m, getTotalSize(d.packets, optFilter));
  }, 0);
};

export const getMaxTime = (data, time) => {
  return data.reduce((t, d) => {
    const packets = d.packets.filter(p => p.time <= time);
    if (packets.length) {
      return Math.max(t, packets[packets.length - 1].time);
    }

    return t;
  }, 0);
}

export const groupByTitle = data => {
  return data.reduce((grouped, d) => {
    if (d.mediaType === 'video') {
      const prev = grouped.filter(g => g.title === d.title);
      let datum;
      if (!prev.length) {
        datum = {
          mediaType: d.mediaType,
          title: d.title,
          packets: {}
        };

        grouped.push(datum);
      } else {
        datum = prev[0];
      }

      datum.packets[d.quality] = d.packets;
    } else {
      grouped.push({
        mediaType: d.mediaType,
        title: d.title,
        packets: d.packets
      });
    }

    return grouped;
  }, []);
};

export const groupByType = data => {
  return data.reduce((grouped, d) => {
    const prev = grouped.filter(g => g.mediaType === d.mediaType);
    let datum;
    if (!prev.length) {
      datum = {
        mediaType: d.mediaType,
        titles: []
      };

      grouped.push(datum);
    } else {
      datum = prev[0];
    }

    datum.titles.push(d);

    return grouped;
  }, []);
}