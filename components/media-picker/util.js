export const addCumulativeSize = data => {
  return data.reduce((s, d) => {
    d.cumulative = s;
    return s + d.size;
  }, 0);
};

export const getTotalSize = data => {
  return data.reduce((s, d) => {
    return s + d.size;
  }, 0);
};

export const getMaxSize = data => {
  return data.reduce((m, d) => {
    return Math.max(m, getTotalSize(d.packets));
  }, 0);
};

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