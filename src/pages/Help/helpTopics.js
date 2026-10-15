// Looking up help topics in help.json: which tab and group a topic is in, and the
// topics before and after it in the same tab (for the links at the bottom of a topic).
export const topicsOf = (tab) =>
  tab.groups.flatMap((group) =>
    group.topics.map((topic) => ({ ...topic, group: group.title })),
  );

export const findTopic = (tabs, id) => {
  for (const tab of tabs) {
    const topics = topicsOf(tab);
    const index = topics.findIndex((topic) => topic.id === id);
    if (index !== -1) {
      return {
        tab,
        topic: topics[index],
        previous: topics[index - 1],
        next: topics[index + 1],
      };
    }
  }
  return null;
};
